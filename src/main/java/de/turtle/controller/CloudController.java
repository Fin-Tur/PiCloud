package de.turtle.controller;

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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import de.turtle.models.FileEntity;
import de.turtle.models.User;
import de.turtle.services.CloudService;
import de.turtle.services.UserService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/files")
public class CloudController {

    private static final Logger logger = LoggerFactory.getLogger(CloudController.class);

    @Autowired
    private CloudService cloudService;

    @Autowired
    private UserService userService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("files") MultipartFile[] files, HttpServletRequest request) {
        String username = AuthController.getCurrentUser(request);
        User owner = userService.findByUsername(username).orElseThrow();

        try {
            if(files.length == 1) {
                FileEntity savedFile = cloudService.storeFile(files[0], owner);
                if(savedFile == null) throw new IllegalArgumentException(); 
                return ResponseEntity.ok(List.of(savedFile));
            }else{
                List<FileEntity> savedFiles = cloudService.storeFiles(files, owner);
                if(savedFiles.isEmpty()) throw new IllegalArgumentException();
                return ResponseEntity.ok(savedFiles);
            }

            
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
    public ResponseEntity<?> enDeCryptFile(@PathVariable Long id, @RequestBody String password, HttpServletRequest request){
        try {
            if(!cloudService.canUserModifyFile(id, AuthController.getCurrentUser(request))){
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid DeleteRequest: User doesnt own file.");
            }

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
    public ResponseEntity<?> deCompressFile(@PathVariable Long id, HttpServletRequest request){
        try {

            if(!cloudService.canUserModifyFile(id, AuthController.getCurrentUser(request))){
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid DeleteRequest: User doesnt own file.");
            }
            if(cloudService.deCompressFile(id)){
            return ResponseEntity.ok("De/Compression Successful!");
            }
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).body("File encryption/decryption not modified");
        } catch (NoSuchElementException e) {
            logger.warn("File not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found: " + e.getMessage());
        }catch (IllegalArgumentException e) {
            logger.warn("Invalid De/Compression request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("De/Compression error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("De/Compression failed: " + e.getMessage());
        }
    }
    

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable Long id, HttpServletRequest request){

        try {

            if(!cloudService.canUserModifyFile(id, AuthController.getCurrentUser(request))){
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid DeleteRequest: User doesnt own file.");
            }

            if (cloudService.deleteFile(id) != null){
                return ResponseEntity.ok("Deletion successful!");
            }
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).body("File not deleted!");
        } catch (NoSuchElementException e) {
            logger.warn("File not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found: " + e.getMessage());
        }catch (IllegalArgumentException e) {
            logger.warn("Invalid delete request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Deleting error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Deleting failed: " + e.getMessage());
        }
        
    }

    @PostMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id, @RequestBody String password) {
        try {
             FileEntity entity = cloudService.getFileById(id);
        byte[] data = cloudService.downloadFile(id, password);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + entity.getName())
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(data);
        } catch (NoSuchElementException e) {
            logger.warn("File not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IOException e) {
            logger.error("File download error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            logger.error("Unexpected download error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/list")
    public ResponseEntity<FileEntity[]> listFiles() {
        FileEntity[] files = cloudService.listFiles();
        return ResponseEntity.ok(files);
    }
}
