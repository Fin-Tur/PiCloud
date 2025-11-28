package de.turtle.PiCloud.services;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.mock.web.MockMultipartFile;

import de.turtle.models.FileEntity;

public class FileUploadTests extends CloudServiceTest{

    @Test
    @DisplayName("Should upload file with compression")
    void shouldUploadFile() {
        //Arrange
        byte[] pngContent = createMockPNGBytes();
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "pic.png",
            "application/png",
            pngContent);
        
        when(repo.findAll()).thenReturn(List.of());
        
        //simulate DB actions
        doAnswer(invocation -> {
            FileEntity entity = invocation.getArgument(0);
            entity.setId(1L);
            return entity;
        }).when(repo).save(any(FileEntity.class));
        
        FileEntity mockEntity = createTestFileEntity(false, false);
        mockEntity.setPath(tempDir.resolve("pic.png").toString());
        when(repo.findById(anyLong())).thenReturn(Optional.of(mockEntity));
        
        when(fisLib.fis_file_check_flag_bytes(any(), anyInt(), eq("png"))).thenReturn(0);
        when(fisLib.fis_dupes_existing_for_file(anyString(), anyString())).thenReturn(0);
        when(fisLib.fis_compress(anyString(), anyInt())).thenReturn(0);
        

        //Act
        FileEntity result = cloudService.storeFile(file, 1L);

        //Assert
        assertNotNull(result);
        assertEquals("pic.png", result.getName());
        verify(repo, times(2)).save(any(FileEntity.class)); //storeFile, deCompress
    }

    @Test
    @DisplayName("Should reject upload of flagged file")
    void shouldRejectFileFlagged(){
        //Arrange
        byte[] data = createMockPNGBytes();
        MockMultipartFile file = new MockMultipartFile(
            "file.exe",           
            "notAPic.exe",    
            null,     
            data);    

        when(repo.findAll()).thenReturn(List.of());

        //Act
        RuntimeException exception = assertThrows(RuntimeException.class, 
        () -> cloudService.storeFile(file, 1L));
    
        //Assert
        assertTrue(exception.getMessage().contains("File upload cancelled due to flag in byte Stream!"));
    }

    @Test
    @DisplayName("Should reject upload of wrong file destination")
    void shouldRejectFileDest(){
        byte[] data = createMockPNGBytes(); 
        MockMultipartFile file = new MockMultipartFile("test.txt", "../../../passwords", "text/plain", data);

        when(repo.findAll()).thenReturn(List.of());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> cloudService.storeFile(file, 1L));

        assertTrue(exception.getMessage().contains("Entry is out of the target Directory!"));
    }

    /*@Test
    @DisplayName("Should reject upload of big file")
    void shouldRejectFileSize(){

        when(repo.findAll()).thenReturn(List.of());
        //TODO
    }
    */
}
