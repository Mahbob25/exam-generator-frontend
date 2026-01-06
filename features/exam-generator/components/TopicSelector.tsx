'use client';

import React, { useState } from 'react';
import { Search, CheckSquare, Square, CheckCheck, XCircle } from 'lucide-react';
import styles from './TopicSelector.module.css';

interface TopicSelectorProps {
    topics: string[];
    selectedTopics: string[];
    onChange: (selected: string[]) => void;
    isLoading?: boolean;
}

export function TopicSelector({
    topics,
    selectedTopics,
    onChange,
    isLoading
}: TopicSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter topics based on search
    const filteredTopics = topics.filter(topic =>
        topic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleTopic = (topic: string) => {
        if (selectedTopics.includes(topic)) {
            onChange(selectedTopics.filter(t => t !== topic));
        } else {
            onChange([...selectedTopics, topic]);
        }
    };

    const selectAll = () => {
        // Only select filtered topics if searching, otherwise all
        const topicsToSelect = searchQuery ? filteredTopics : topics;

        // Merge with existing selection
        const newSelection = Array.from(new Set([...selectedTopics, ...topicsToSelect]));
        onChange(newSelection);
    };

    const selectNone = () => {
        onChange([]);
    };

    if (isLoading) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.spinner} />
                <p>جاري تحميل المواضيع...</p>
            </div>
        );
    }

    if (topics.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>لا توجد مواضيع متاحة</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Search and Actions */}
            <div className={styles.actions}>
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="ابحث عن موضوع..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                        dir="rtl"
                    />
                </div>

                <div className={styles.buttons}>
                    <button
                        type="button"
                        onClick={selectAll}
                        className={`${styles.actionButton} ${styles.selectAll}`}
                    >
                        <CheckCheck size={16} />
                        <span>الكل</span>
                    </button>
                    <button
                        type="button"
                        onClick={selectNone}
                        className={`${styles.actionButton} ${styles.selectNone}`}
                    >
                        <XCircle size={16} />
                        <span>إلغاء</span>
                    </button>
                </div>
            </div>

            {/* Topics List */}
            <div className={styles.topicList}>
                {filteredTopics.length === 0 ? (
                    <div className={styles.emptyState}>
                        لا توجد مواضيع تطابق البحث
                    </div>
                ) : (
                    filteredTopics.map((topic) => {
                        const isSelected = selectedTopics.includes(topic);
                        return (
                            <button
                                key={topic}
                                type="button"
                                onClick={() => toggleTopic(topic)}
                                className={`${styles.topicButton} ${isSelected ? styles.selected : ''}`}
                            >
                                {isSelected ? (
                                    <CheckSquare className={styles.icon} size={20} />
                                ) : (
                                    <Square className={styles.icon} size={20} />
                                )}
                                <span>{topic}</span>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Stats */}
            <div className={styles.stats}>
                <span>
                    {filteredTopics.length} من {topics.length} موضوع
                </span>
                <span className={styles.selectedCount}>
                    تم اختيار {selectedTopics.length}
                </span>
            </div>
        </div>
    );
}

export default TopicSelector;
