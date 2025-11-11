package de.turtle.models;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DirRepository extends JpaRepository<DirEntity, Long>{

    public boolean existsByNameIgnoreCase(String name);

    Optional<DirEntity> findByName(String name);
    
}
