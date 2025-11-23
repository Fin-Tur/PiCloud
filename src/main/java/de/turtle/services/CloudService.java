package de.turtle.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import de.turtle.extern.FisLib;
import de.turtle.models.FileEntity;
import de.turtle.models.FileEntityRepository;
import de.turtle.models.User;
import de.turtle.models.UserRepository;
import jakarta.annotation.Nonnull;
import jakarta.transaction.Transactional;


@Service
public class CloudService {

     private static final Logger log = LoggerFactory.getLogger(CloudService.class);

    @Value("${app.file-storage.path:C:/temp/pi_cloud/files}")
    private String storagePath;
    
    @Value("${app.compression.entropy-threshold:5.0}")
    private double compressionEntropyThreshold;
    
    @Value("${app.compression.level:10}")
    private int compressionLevel;
    
    @Value("${app.encryption.iterations:10000}")
    private int encryptionIterations; 

    @Value("${app.file.max-size:100}")
    private int maxFileSize;

    @Autowired
    public FileEntityRepository fileEntityRepository;

    @Autowired
    private UserRepository userRepository;


    private FisLib getFisLib() {
        try {
            return FisLib.load();
        } catch (Exception e) {
            log.error("Failed to load FIS native library", e);
            throw new RuntimeException("FIS library not available", e);
        }
    }

    public FileEntity getFileById(Long id) {
        return fileEntityRepository.findById(id).orElseThrow();
    }

    private User getUserById(Long id){
        return userRepository.findById(id).orElseThrow();
    }

    public void saveFile(@Nonnull FileEntity file){
        fileEntityRepository.save(file);
        }

    
    @Transactional
    public FileEntity storeFile(MultipartFile file, Long ownerId){
        try {
            Path dirPath = Paths.get(storagePath);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            if(file.getSize() > maxFileSize){
                log.error("File too big to be stored. Check app.file.max-size");
                return null;
            }

            for(FileEntity fe : fileEntityRepository.findAll()){
                if(!fe.getName().equalsIgnoreCase(file.getOriginalFilename())){
                } else {
                    log.error("File with same name already exists in DB!");
                    return null;
                }
            }

            Path filePath = dirPath.resolve(file.getOriginalFilename()).normalize();
            if(!filePath.startsWith(storagePath)){
                throw new IOException("Entry is out of the target Directory!");
            }
            Files.copy(file.getInputStream(), filePath);

            User owner = getUserById(ownerId);

            FileEntity entity = new FileEntity(
                owner,
                null,
                file.getOriginalFilename(),
                filePath.toString(),
                file.getSize(),
                file.getContentType(),
                LocalDateTime.now()
            );

            fileEntityRepository.save(entity);

            //Check duplicate
            if(scanDupes(entity.getId()) == 1){
                log.info("File is Duplicate: Uploading terminated");
                deleteFile(entity.getId());
                return null;
            }

            //Check entropy
            if(fileEntropy(entity.getId()) < compressionEntropyThreshold){
                log.info("Uploaded file's entropy below compressionEntropyTreshhold. File will be compressed.");
                deCompressFile(entity.getId());
            }

            log.info("Saved new file succesfully");
            return entity;
                    
        } catch (Exception e) {
            throw new RuntimeException("IOExcep occured while saving files to database " + e);
        }
    }

    @Transactional
    public List<FileEntity> storeFiles(MultipartFile[] files, Long ownerId){
        List<FileEntity> savedFiles = new ArrayList<>();
        for (MultipartFile file : files) {
            FileEntity savedFile = storeFile(file, ownerId);
            if(savedFile == null) continue;
            savedFiles.add(savedFile);
        }
        
        return savedFiles;
    }

    @Transactional
    public byte[] downloadFile(Long id, String password){
        FileEntity entity = getFileById(id);
        Path filePath = Paths.get(entity.getPath());
        
        try {
            Path tempPath = Files.createTempFile("download_", "_" + entity.getName());
            Files.copy(filePath, tempPath, StandardCopyOption.REPLACE_EXISTING);
            
            try {
                if(entity.isCompressed()){
                    getFisLib().fis_decompress(tempPath.toString());
                }
                if(entity.isEncrypted()){
                    getFisLib().fis_decrypt(tempPath.toString(), password, encryptionIterations);
                }

                log.info("Downloaded file: " + entity.getName() + " from " + filePath.toString());
                return Files.readAllBytes(tempPath);

            } finally {
                Files.deleteIfExists(tempPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to download file " + e);
        }
    }

    @Transactional
    public FileEntity[] listFiles() {
        return fileEntityRepository.findAll().toArray(FileEntity[]::new);
    }

    @Transactional
    public FileEntity deleteFile(Long id){
        FileEntity entity = getFileById(id);
        Path filePath = Paths.get(entity.getPath());
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("File does not exist (IOExcep)");
        }

        fileEntityRepository.deleteById(id);
        log.info("Deleted file: " + entity.getName() + " from " + filePath.toString());
        return entity;
    }

    @Transactional
    public boolean enDeCryptFile(Long id, String password){
        if(password.isEmpty()){
            log.error("En/Decryption failed. Password is empty!");
            return false;
        } 
        FileEntity entity = getFileById(id);
        Path filePath = Paths.get(entity.getPath());

        if (!HelperFunctions.fileAtPathIsSafeToModify(storagePath, filePath)) {
            log.warn("File @ {} is not safe to modify!", entity.getName());
            return false;
        }

        int result;
            
        if(entity.isEncrypted()){
            result = getFisLib().fis_decrypt(filePath.toString(), password, encryptionIterations);
            if(result == 0){
                entity.setEncrypted(false);
                fileEntityRepository.save(entity);
                log.info("Decryption successful for file: {}", entity.getName());
                return true;
            }else{
                log.error("Error decrypting file {}, result code: {}", entity.getName(), result);
                return false;
            }
        } else {
            result = getFisLib().fis_encrypt(filePath.toString(), password, encryptionIterations);
            if(result == 0){
                entity.setEncrypted(true);
                fileEntityRepository.save(entity);
                log.info("Encryption successful for file: {}", entity.getName());
                return true;
            }else{
                log.error("Error encrypting file {}, result code: {}", entity.getName(), result);
                return false;
            }
        }
    }


    @Transactional
    public boolean deCompressFile(Long id){
        FileEntity entity = getFileById(id);
        Path filePath = Paths.get(entity.getPath());

         if(!HelperFunctions.fileAtPathIsSafeToModify(storagePath, filePath)){
            log.warn("File @ " + entity.getName() + " is not safe to modify!");
            return false;
        }

        int result;
        if(entity.isCompressed()){
            result = getFisLib().fis_decompress(filePath.toString());
            if(result == 0){
                entity.setCompressed(false);
                fileEntityRepository.save(entity);
                log.info("Decompressed file {}", entity.getName());
                return true;
            }else{
                log.error("Decompression of file {} failed. Error code: {}", entity.getName(), result);
                return false;
            }
        }else{
            result = getFisLib().fis_compress(filePath.toString(), compressionLevel);
            if(result == 0){
                entity.setCompressed(true);
                fileEntityRepository.save(entity);
                log.info("Compressed file {}", entity.getName());
                return true;
            }else{
                log.error("Compression of file {} failed. Error code: {}", entity.getName(), result);
                return false;
            }
        }
    }

    @Transactional
    public int scanDupes(Long id) throws IOException{
        FileEntity entity = getFileById(id);
        Path filePath = Paths.get(entity.getPath());
        int result = getFisLib().fis_dupes_existing_for_file(storagePath, filePath.toString());
        switch (result) {
            case 0 -> {log.info("No Duplicates in Storage."); return 0;}
            case 1 -> {log.info("File {} is new Duplicate.", entity.getName()); return 1;}
            case 2 -> {log.info("Dupes existing in Storage!"); return 2;}
            default ->
                log.error("Duplicate scanning gone wrong.");
        }
        return -1;
    }

    @Transactional
    public double fileEntropy(Long id) throws IOException{
        FileEntity entity = getFileById(id);
        Path filePath = Paths.get(entity.getPath());
        double entropy = getFisLib().fis_entropy_for_file(filePath.toString());
        if(entropy == -1){
            log.error("Entropy scan gone wrong.");
            return -1;
        }
        return entropy;
    }

    @Transactional
    public String getCloudInfo() {
        return "Cloud information";
    }

    public boolean canUserModifyFile(Long fileId, Long userID){
        return getFileById(fileId).getOwnerUsername().equals(getUserById(userID).getUsername());   
    }
}
