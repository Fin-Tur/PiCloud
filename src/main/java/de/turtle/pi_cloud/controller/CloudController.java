package de.turtle.pi_cloud.controller;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import de.turtle.pi_cloud.models.FileEntity;
import de.turtle.pi_cloud.services.CloudService;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*") //ONLY FOR TESTING, RESTRICT IN PRODUCTION
public class CloudController {

    private static final Logger logger = LoggerFactory.getLogger(CloudController.class);

    @Autowired
    private CloudService cloudService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("files") MultipartFile[] files) {
        try {
            if(files.length == 1) {
                FileEntity savedFile = cloudService.storeFile(files[0]);
                return ResponseEntity.ok(List.of(savedFile));
            }
            List<FileEntity> savedFiles = cloudService.storeFiles(files);
            return ResponseEntity.ok(savedFiles);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid file upload request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            logger.error("File storage error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("File upload failed: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
        
    }

    @PostMapping("/encryption/{id}")
    public ResponseEntity<?> enDeCryptFile(@PathVariable Long id, @RequestBody String password){
        try {
            if(cloudService.enDeCryptFile(id, password)) {
                return ResponseEntity.ok("File encryption/decryption successful");
            }
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).body("File encryption/decryption not modified");
        } catch (NoSuchElementException e) {
            logger.warn("File not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid encryption/decryption request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Encryption/Decryption error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Encryption/Decryption failed: " + e.getMessage());
        }
        
    }

    @PostMapping("/compression/{id}")
    public ResponseEntity<String> deCompressFile(@PathVariable Long id) throws IOException {
        if(cloudService.deCompressFile(id)){
            return ResponseEntity.ok("Success");
        }
        return ResponseEntity.noContent().build();
    }
    

    @PostMapping("/delete/{id}")
    public ResponseEntity<String> deleteFile(@PathVariable Long id) throws IOException {
        if (cloudService.deleteFile(id) != null){
            return ResponseEntity.ok("Success");
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) throws IOException {
        FileEntity entity = cloudService.fileEntityRepository.findById(id).orElseThrow();
        byte[] data = cloudService.downloadFile(id);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + entity.getName())
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(data);
    }

    @GetMapping("/list")
    public ResponseEntity<FileEntity[]> listFiles() {
        FileEntity[] files = cloudService.listFiles();
        return ResponseEntity.ok(files);
    }
}
