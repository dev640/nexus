package com.nexus.backend.repository;

import com.nexus.backend.domain.chat.ChatChannel;
import com.nexus.backend.domain.chat.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChannelOrderByIdDesc(ChatChannel channel, Pageable pageable);

    List<ChatMessage> findByChannelAndIdLessThanOrderByIdDesc(ChatChannel channel, Long before, Pageable pageable);

    /** Newest message id in a channel — the seed for unread counting. */
    @Query("select max(m.id) from ChatMessage m where m.channel = :channel")
    Optional<Long> findLatestIdByChannel(@Param("channel") ChatChannel channel);

    @Query("select m from ChatMessage m join fetch m.author where m.id = :id")
    Optional<ChatMessage> findWithAuthorById(@Param("id") Long id);

    long countByChannel(ChatChannel channel);

    long countByChannelAndIdGreaterThan(ChatChannel channel, Long id);

    @Query("""
        select m from ChatMessage m
        join fetch m.author
        where m.channel in :channels and lower(m.body) like lower(concat('%', :term, '%'))
        order by m.id desc
        """)
    List<ChatMessage> searchInChannels(@Param("channels") List<ChatChannel> channels,
                                       @Param("term") String term,
                                       Pageable pageable);
}
