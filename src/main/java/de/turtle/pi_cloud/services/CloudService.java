package de.turtle.pi_cloud.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import de.turtle.pi_cloud.models.FileEntity;
import de.turtle.pi_cloud.models.FileEntityRepository;
import lombok.extern.slf4j.Slf4j;



@Slf4j
@Service
public class CloudService {

    private final String storagePath = "C:/temp/pi_cloud/files"; // Example Path

    @Autowired
    public FileEntityRepository fileEntityRepository;

    public FileEntity storeFile(MultipartFile file) throws IOException {
        Path dirPath = Paths.get(storagePath);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }
        Path filePath = dirPath.resolve(file.getOriginalFilename());
        Files.copy(file.getInputStream(), filePath);

        FileEntity entity = new FileEntity(
            file.getOriginalFilename(),
            filePath.toString(),
            file.getSize(),
            file.getContentType(),
            LocalDateTime.now()
        );
        log.info("Saved file: " + file.getOriginalFilename() + " at " + filePath.toString());
        return fileEntityRepository.save(entity);
    }

    public List<FileEntity> storeFiles(MultipartFile[] files) throws IOException {
        List<FileEntity> savedFiles = new ArrayList<>();
        for (MultipartFile file : files) {
            FileEntity savedFile = storeFile(file);
            savedFiles.add(savedFile);
        }
        return savedFiles;
    }

    public byte[] downloadFile(Long id) throws IOException {
        FileEntity entity = fileEntityRepository.findById(id).orElseThrow();
        Path filePath = Paths.get(entity.getPath());
        log.info("Downloaded file: " + entity.getName() + " from " + filePath.toString());
        return Files.readAllBytes(filePath);
    }

    public FileEntity[] listFiles() {
        return fileEntityRepository.findAll().toArray(new FileEntity[0]);
    }

    public FileEntity deleteFile(Long id) throws IOException {
        FileEntity entity = fileEntityRepository.findById(id).orElseThrow();
        Path filePath = Paths.get(entity.getPath());
        Files.deleteIfExists(filePath);
        fileEntityRepository.deleteById(id);
        log.info("Deleted file: " + entity.getName() + " from " + filePath.toString());
        return entity;
    }

    public boolean enDeCryptFile(Long id, String password) {
        FileEntity entity = fileEntityRepository.findById(id).orElseThrow();
        Path filePath = Paths.get(entity.getPath());

        if (!HelperFunctions.fileAtPathIsSafeToModify(storagePath, filePath)) {
            log.warn("File @ {} is not safe to modify!", entity.getName());
            return false;
        }

        List<String> cmd = new ArrayList<>();
        cmd.add("fis");
        if (entity.isEncrypted()) {
            cmd.add("-decrypt");
        } else {
            cmd.add("-encrypt");
        }
        cmd.add(filePath.toString());
        cmd.add(password); 

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectErrorStream(true); 

        try {
            Process p = pb.start();
            boolean finished = p.waitFor(60, java.util.concurrent.TimeUnit.SECONDS);
            if (!finished) {
                p.destroyForcibly();
                log.error("fis timed out");
                return false;
            }
            int exit = p.exitValue();
            if (exit == 0) {
                entity.setEncrypted(!entity.isEncrypted());
                fileEntityRepository.save(entity);
                log.info("De/En-cryption successful for {}", entity.getName());
                return true;
            } else {
                log.error("fis exit code {}", exit);
                return false;
            }
        } catch (Exception e) {
            log.error("Error during encryption/decryption", e);
            return false;
    }
}


    public boolean deCompressFile(Long id) throws IOException {
        FileEntity fileEntity = fileEntityRepository.findById(id).orElseThrow();
        Path filePath = Paths.get(fileEntity.getPath());

         if(!HelperFunctions.fileAtPathIsSafeToModify(storagePath, filePath)){
            log.warn("File @ " + fileEntity.getName() + " is not safe to modify!");
            return false;
        }

        ProcessBuilder pb = new ProcessBuilder();
        List<String> cmd = new ArrayList<>();
        cmd.add("fis");
        if(fileEntity.isCompressed()){
            cmd.add("-decompress");
        }else{
            cmd.add("-compress");
        }
        cmd.add(filePath.toString());

        try {
                Process p = pb.start();
                boolean finished = p.waitFor(60, java.util.concurrent.TimeUnit.SECONDS);
                if (!finished) {
                    p.destroyForcibly();
                    log.error("fis timed out");
                    return false;
                }
                int exitValue = p.exitValue();
                if(exitValue == 0){
                    fileEntity.setCompressed(!fileEntity.isCompressed());
                    fileEntityRepository.save(fileEntity);
                    log.info("De/En-cryption successful for {}", fileEntity.getName()); 
                }else{
                    log.info("An error occured de/compressing file @ " + fileEntity.getPath().toString());
                }
        } catch (Exception e) {
                log.error("Error occured during de/compression " + e.getMessage());
        }
        return false;
    }


    public String getCloudInfo() {
        return "Cloud information";
    }
}
