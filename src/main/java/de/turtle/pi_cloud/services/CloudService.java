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

    public boolean enDeCryptFile(Long id, String password) throws IOException {
        FileEntity entity = fileEntityRepository.findById(id).orElseThrow();
        Path filePath = Paths.get(entity.getPath());
        ProcessBuilder pb = new ProcessBuilder();
        if(entity.isEncrypted()) {
            pb.command("cmd.exe", "/c", "fis -decrypt " + filePath.toString() + " " + password);
            entity.setEncrypted(false);
            log.info("Decrypted file: " + entity.getName() + " at " + filePath.toString());
        } else {
            entity.setEncrypted(true);
            pb.command("cmd.exe", "/c", "fis -encrypt " + filePath.toString() + " " + password);
            log.info("Encrypted file: " + entity.getName() + " at " + filePath.toString());
        }
        try {
            Process process = pb.start();
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                fileEntityRepository.save(entity);
                log.info("Successfully en/decrypted file: " + entity.getName());
                return true;
            }
        } catch (Exception e) {
            log.error("Error during encryption/decryption: " + e.getMessage());
            return false;
        }
        return false;
    }

    public String getCloudInfo() {
        return "Cloud information";
    }
}
