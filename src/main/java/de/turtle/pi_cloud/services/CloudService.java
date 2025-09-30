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
        return entity;
    }

    public String getCloudInfo() {
        return "Cloud information";
    }
}
