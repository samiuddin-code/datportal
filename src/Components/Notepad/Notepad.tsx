import React from "react";
import styles from "./styles.module.scss"; // Import the SCSS module with the correct name

interface Note {
  notes: string;
}

interface NotePadState {
  notesText: string;
  noteList: Note[];
  editingIndex: number | null; // Track which note is being edited
}

class NotePad extends React.Component<{}, NotePadState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      notesText: "",
      noteList: [], // Initialize with an empty array
      editingIndex: null // No note is being edited initially
    };
  }

  onSaveNotes = () => {
    if (this.state.notesText.trim()) {
      if (this.state.editingIndex !== null) {
        // Update the existing note
        const updatedNotes = this.state.noteList.map((note, index) =>
          index === this.state.editingIndex
            ? { notes: this.state.notesText }
            : note
        );
        this.setState({
          noteList: updatedNotes,
          notesText: "",
          editingIndex: null
        });
      } else {
        // Replace the existing note with the new one if it exists
        if (this.state.noteList.length > 0) {
          const updatedNoteList = [{ notes: this.state.notesText }];
          this.setState({
            noteList: updatedNoteList,
            notesText: ""
          });
        } else {
          // Add a new note if no note exists
          const newNote: Note = { notes: this.state.notesText };
          this.setState(prevState => ({
            noteList: [newNote],
            notesText: ""
          }));
        }
      }
    }
  };

  onChangeValue = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      notesText: event.target.value
    });
  };

  onDeleteNote = (index: number) => {
    const filteredNotes = this.state.noteList.filter((_, i) => i !== index);
    this.setState({
      noteList: filteredNotes,
      notesText: "" // Clear text area on deletion
    });
  };

  onEditNote = (index: number) => {
    this.setState({
      notesText: this.state.noteList[index].notes,
      editingIndex: index
    });
  };

  render() {
    return (
      <div className={styles.notePad}>
        <div className={styles.header}>
          <h2>Notes</h2>
        </div>
        <div className={styles.inputSection}>
          <textarea
            rows={5}
            placeholder="Enter notes here..."
            value={this.state.notesText}
            onChange={this.onChangeValue}
            className={styles.textarea}
          />
          <button
            className={styles.saveButton}
            onClick={this.onSaveNotes}
          >
            {this.state.editingIndex !== null ? "Update" : "Save"}
          </button>
        </div>
        <div className={styles.notesList}>
          {this.state.noteList.length > 0 ? (
            this.state.noteList.map((item, index) => (
              <div key={index} className={styles.noteItem}>
                <div className={styles.noteHeader}>
                  <h3>Note {index + 1}</h3>
                  <div className={styles.noteActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => this.onEditNote(index)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => this.onDeleteNote(index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className={styles.noteContent}>{item.notes}</p>
              </div>
            ))
          ) : (
            <p>No notes available</p>
          )}
        </div>
      </div>
    );
  }
}

export default NotePad;
