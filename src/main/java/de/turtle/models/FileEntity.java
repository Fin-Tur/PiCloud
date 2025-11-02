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

	private String name;
	private String path;
	private Long size;
	private String type;
	private LocalDateTime uploadedAt;
	private boolean encrypted = false;
	private boolean compressed = false;

	public FileEntity() {}

	public FileEntity(User owner, String name, String path, Long size, String type, LocalDateTime uploadedAt) {
		this.owner = owner;
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
	public String getOwnerUsername() { 
		return this.owner != null ? owner.getUsername() : null; 
	}
	public void setOwner(User owner) {this.owner = owner;}
}
