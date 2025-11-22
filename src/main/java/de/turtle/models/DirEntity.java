package de.turtle.models;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "directories")
public class DirEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "dir", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<FileEntity> files = new ArrayList<>();

    @NotBlank(message = "Directory name cannot be empty")
    @Size(min = 1, max = 100, message = "Directory name must be between 1 and 100 characters")
    private String name;
    
    private boolean isProtected = false;
    
    @Size(max = 255, message = "Hashed password cannot exceed 255 characters")
    private String hashedPassword;

    public DirEntity(){}

    public DirEntity(User owner, String name){
        this.owner = owner;
        this.name = name;  
    }

    public DirEntity(User owner, String name, String hashedPassword){
        this.owner = owner;
        this.name = name;  
        this.isProtected = true;
        this.hashedPassword = hashedPassword;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOwnerUsername() {
        return owner.getUsername();
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public boolean isProtected(){
        return this.isProtected;
    }

    public void setProtected(boolean isProtected){
        this.isProtected = isProtected;
    }

    public String getPassword(){
        return this.hashedPassword;
    }

    public void setHashedPassword(String hashedPassword){
        this.hashedPassword = hashedPassword;
    }

    public List<FileEntity> getFiles() {
        return files;
    }

    public void addFile(FileEntity file){
        this.files.add(file);
        file.setDir(this);
    }

    public boolean removeFile(FileEntity file){
        if(this.files.contains(file)){
            this.files.remove(file);
            file.setDir(null);
            return true;
        }else{
            return false;
        }
    }

    public void setFiles(List<FileEntity> files) {
        this.files = files;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
