package de.turtle.services;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import de.turtle.models.DirEntity;
import de.turtle.models.DirRepository;
import de.turtle.models.FileEntity;
import de.turtle.models.FileEntityRepository;
import de.turtle.models.User;
import de.turtle.models.UserRepository;
import jakarta.annotation.Nonnull;
import jakarta.transaction.Transactional;

@Service
public class DirService {

    private static final Logger log = LoggerFactory.getLogger(DirService.class);
    
    @Autowired
    private CloudService cloudService;

    @Autowired
    private DirRepository dirRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileEntityRepository fileEntityRepository;

    public DirEntity getDirById(@Nonnull Long id){
        return dirRepository.findById(id).orElseThrow();
    }

    private User getUserById(@Nonnull Long id){
        return userRepository.findById(id).orElseThrow();
    }

    private FileEntity getFileById(@Nonnull Long id){
        return fileEntityRepository.findById(id).orElseThrow();
    } 

        @Transactional
    public DirEntity createDir(String name, Long ownerId) throws Exception{
        if(dirRepository.existsByNameIgnoreCase(name)){
            log.error("Dir with name {} already exists!", name);
            return null;
        }

        User owner = getUserById(ownerId);
        DirEntity dir = new DirEntity(owner, name);
        dirRepository.save(dir);
        log.info("Added Dir: {}", name);
        return dir;
    }

    @Transactional
    public DirEntity moveFileToDir(Long fileId, Long dirId) throws Exception{
        DirEntity dir = getDirById(dirId);
        FileEntity file = getFileById(fileId);

        for(FileEntity f : dir.getFiles()){
            if(f.equals(file)){
                log.error("File is already in Dir!");
                return null;
            }
        }

        dir.addFile(file);
        log.info("Added file {} to Dir {}", file.getName(), dir.getName());

        return dir;
    }

    public FileEntity[] getFilesFromDir(Long id) throws Exception{
        DirEntity dir = getDirById(id);
        return dir.getFiles().toArray(FileEntity[]::new);
    }

    @Transactional
    public DirEntity deleteDir(Long id)throws Exception{
        DirEntity dir = getDirById(id);
        for(FileEntity f : dir.getFiles()){
            try{
                cloudService.deleteFile(f.getId());
            }catch(IOException e){
                log.error("Error occured trying do delete file {}", f.getId());
            }
        }
        dirRepository.delete(dir);
        return dir;
    }

    public boolean canUserModifyDir(Long dirId, Long userId){
        return getDirById(dirId).getOwnerUsername().equals(getUserById(userId).getUsername());
    }
}
