package de.turtle.models;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DirRepository extends JpaRepository<DirEntity, Long>{

    public boolean existsByNameIgnoreCase(String name);
    
}
