import React, { useState, useEffect, useRef } from 'react';
import Button from '../Button';
import { workOrderAPI } from '../../utils/api';
import { operatorsAPI } from '../../utils/api';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AddNoteFormProps {
  workOrderId: number;
  onSuccess: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

const AddNoteForm: React.FC<AddNoteFormProps> = ({ workOrderId, onSuccess, onCancel, isVisible }) => {
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionListRef = useRef<HTMLDivElement>(null);
  const [mentions, setMentions] = useState<string[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  // Fetch users for mention
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await operatorsAPI.getAll();
        setUsers(response.operators || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewNote(value);

    // Check for @ symbol
    const lastAtSymbol = value.lastIndexOf('@');
    if (lastAtSymbol !== -1 && lastAtSymbol >= value.lastIndexOf(' ')) {
      const filterText = value.slice(lastAtSymbol + 1);
      setMentionFilter(filterText);
      setShowMentionList(true);

      // Calculate mention list position
      if (textareaRef.current) {
        const { selectionStart } = textareaRef.current;
        const textBeforeCursor = value.slice(0, selectionStart);
        const lines = textBeforeCursor.split('\n');
        const currentLineNumber = lines.length - 1;
        const currentLine = lines[currentLineNumber];

        const lineHeight = 20; // Approximate line height in pixels
        const charWidth = 8; // Approximate character width in pixels

        const top = (currentLineNumber + 1) * lineHeight;
        const left = currentLine.length * charWidth;

        setCursorPosition({ top, left });
      }
    } else {
      setShowMentionList(false);
    }
  };

  const handleMentionSelect = (username: string) => {
    const lastAtSymbol = newNote.lastIndexOf('@');
    const newValue = newNote.slice(0, lastAtSymbol) + '@' + username + ' ';
    setNewNote(newValue);
    setMentions([...mentions, username]);
    setShowMentionList(false);
    textareaRef.current?.focus();
  };

  const filteredUsers = users.filter((user) => user.username.toLowerCase().includes(mentionFilter.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsLoading(true);
    try {
      // Kirim note ke API
      await workOrderAPI.addCustomLog(workOrderId, {
        note: newNote.trim(),
      });

      // Reset form
      setNewNote('');
      setMentions([]);

      // Notify parent & close form
      onSuccess();
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Close mention list when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mentionListRef.current && !mentionListRef.current.contains(event.target as Node)) {
        setShowMentionList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderFormattedNote = () => {
    if (!newNote) {
      return (
        <span className='text-gray-500 dark:text-gray-400'>Tulis catatan... Gunakan @ untuk mention seseorang</span>
      );
    }

    return newNote.split(' ').map((word, index) => {
      if (word.startsWith('@') && mentions.includes(word.slice(1))) {
        return (
          <span key={index} className='inline-flex items-center mx-0.5'>
            <span
              className='bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300
                         px-1.5 py-0.5 rounded-md font-medium text-sm'
            >
              {word}
            </span>
          </span>
        );
      }
      return (
        <span key={index} className='text-gray-900 dark:text-gray-100'>
          {word}{' '}
        </span>
      );
    });
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out
      ${isVisible ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}
    >
      <form onSubmit={handleSubmit} className='mb-4'>
        <div className='space-y-4'>
          <div className='relative'>
            {/* Preview area */}
            <div
              ref={previewRef}
              className='w-full px-3 py-2 text-sm min-h-[5rem] border border-gray-300 dark:border-gray-600
                       rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       pointer-events-none'
            >
              {renderFormattedNote()}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              className='w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600
                       rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500
                       focus:border-primary-500 dark:bg-gray-800 dark:text-gray-100
                       absolute inset-0 opacity-0 z-10'
              rows={3}
              placeholder='Write a note... Use @ to mention someone'
              value={newNote}
              onChange={handleTextareaChange}
              required
            />

            {/* Mention list dropdown */}
            {showMentionList && filteredUsers.length > 0 && (
              <div
                ref={mentionListRef}
                className='absolute z-20 w-64 mt-1 bg-white dark:bg-gray-800 rounded-md
                         shadow-lg border border-gray-200 dark:border-gray-700'
                style={{
                  top: `${cursorPosition.top}px`,
                  left: `${cursorPosition.left}px`,
                }}
              >
                <ul className='py-1 max-h-48 overflow-auto'>
                  {filteredUsers.map((user) => (
                    <li
                      key={user.id}
                      className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer
                               flex items-center justify-between group'
                      onClick={() => handleMentionSelect(user.username)}
                    >
                      <span
                        className='text-gray-900 dark:text-gray-100 group-hover:text-primary-600
                                   dark:group-hover:text-primary-400 flex items-center'
                      >
                        <span className='w-2 h-2 rounded-full bg-green-500 mr-2'></span>
                        {user.username}
                      </span>
                      <span className='text-xs text-gray-500 dark:text-gray-400'>{user.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className='flex justify-end space-x-2'>
            <Button variant='secondary' size='sm' type='button' onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant='primary' size='sm' type='submit' isLoading={isLoading}>
              Save Note
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddNoteForm;
