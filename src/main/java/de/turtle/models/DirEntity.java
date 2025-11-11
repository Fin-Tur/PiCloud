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

    private String name;

    public DirEntity(){}

    public DirEntity(User owner, String name){
        this.owner = owner;
        this.name = name;
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
