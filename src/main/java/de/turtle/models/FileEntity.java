package de.turtle.models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "files")
public class FileEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

	@JsonIgnore 
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "dir_id", nullable = true)
	private DirEntity dir;

	@NotBlank(message = "File name cannot be empty")
	@Size(max = 255, message = "File name cannot exceed 255 characters")
	private String name;
	
	@NotBlank(message = "File path cannot be empty")
	private String path;
	
	@NotNull(message = "File size cannot be null")
	@Positive(message = "File size must be positive")
	private Long size;
	
	@NotBlank(message = "File type cannot be empty")
	private String type;
	
	@NotNull(message = "Upload date cannot be null")
	private LocalDateTime uploadedAt;
	
	private boolean encrypted = false;
	private boolean compressed = false;

	public FileEntity() {}

	public FileEntity(User owner, DirEntity dir, String name, String path, Long size, String type, LocalDateTime uploadedAt) {
		this.owner = owner;
		this.dir = dir;
		this.name = name;
		this.path = path;
		this.size = size;
		this.type = type;
		this.uploadedAt = uploadedAt;
	}

	
	public Long getId() { return id; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public String getPath() { return path; }
	public void setPath(String path) { this.path = path; }
	public Long getSize() { return size; }
	public void setSize(Long size) { this.size = size; }
	public String getType() { return type; }
	public void setType(String type) { this.type = type; }
	public LocalDateTime getUploadedAt() { return uploadedAt; }
	public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
	public boolean isEncrypted() { return encrypted; }
	public void setEncrypted(boolean encrypted) { this.encrypted = encrypted; }
	public boolean isCompressed() { return compressed; }
	public void setCompressed(boolean compressed) { this.compressed = compressed; }
	public DirEntity getDir(){ return this.dir; }
	public void setDir(DirEntity dir) { this.dir = dir; }
	public String getOwnerUsername() { 
		return this.owner != null ? owner.getUsername() : null; 
	}
	public void setOwner(User owner) {this.owner = owner;}

	@Override
	public boolean equals(Object o){
		if(this == o) return true;
		if(!(o instanceof FileEntity)) return false;
		FileEntity other = (FileEntity) o;
		return other.id != null && other.id.equals(this.id);
	}

	@Override
	public int hashCode() {
		return getClass().hashCode();
	}
}
