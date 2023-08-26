import React, { useRef, useState, useEffect } from 'react';
import { Container, Typography, TextField, Button } from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';


function Note({ note, Mnotes, MsetNotes }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [notes, setNotes] = useState(Mnotes || []);
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
    const [selectedComponents, setSelectedComponents] = useState([]);
    const [backspaceFlag, setBackspaceFlag] = useState(false);
    const [curDropPosition, setCurDropPosition] = useState(null)
    const [afterSelection, setAfterSelection] = useState(false)
    const [curNoteTxt, setCurNoteTxt] = useState('') // testing
    const noteRef = useRef();

    useEffect(() => {
        return () => {
            setShowDropdown(false);
            MsetNotes(notes)
        }
    }, [])

    const getClientRectAtPosition = (element, position) => {
        const range = document.createRange();
        range.setStart(element.firstChild, position);
        range.setEnd(element.firstChild, position);
        return range.getBoundingClientRect();
    };
    const updateNote = (val, e) => {
        let updatedNotes = notes.map(nt => {
            if(nt.id === note.id){
                return {
                    ...nt,
                    value: val,
                }
            }
        })
        setNotes(updatedNotes);
        setCurNoteTxt(val) // testing
        noteRef.current.innerHTML= `<p>${val}</p>`
        noteRef.current.focus(); // Add this line to ensure the div retains focus
        placeCaretAtEnd(noteRef.current);
    }

    // Function to place caret at the end of a contentEditable element
    function placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange !== "undefined") {
            const textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

    const handleOnChange = (e) => {
        if(afterSelection)
            return setAfterSelection(false);
        const curTxt = e.target.textContent;
        const curTrimTxt = curTxt.trim();
        const oldVal = curNoteTxt;

        if(curDropPosition && curTxt.length < curDropPosition) {
            setCurDropPosition(null)
            setShowDropdown(false);
            updateNote(curTxt);
        } else if (curTrimTxt.endsWith('<>')) {
            const { selectionStart } = e.target;
            const divRect = e.target.getBoundingClientRect();
            const caretRect = getClientRectAtPosition(e.target, selectionStart);

            const x = divRect.left + caretRect.left;
            const y = divRect.top + caretRect.top + caretRect.height;

            setDropdownPosition({ x, y });
            setCurDropPosition(curTrimTxt.length)
            setShowDropdown(true);
            updateNote(curTxt)
        } else if(showDropdown) {
            let updatedNotes = notes.map(nt => {
                if(nt.id === note.id){
                    return {
                        ...nt,
                        value: curTxt
                    }
                }
                return nt;
            })
            setNotes(updatedNotes)
        } else {
            console.log('here')
            updateNote(curTxt, e)
        }
    };

    const handleOptionSelect = (option) => {
        const selectedComponent = `\$\{${option.id}\}`;
        let newValue
        // let newValue = noteRef.current.textContent.trim().slice(0, -2) + selectedComponent
        let newDisplayVal = substituteVariables(newValue);
        console.log(newValue, newDisplayVal)
        // noteRef.current.textContent = newDisplayVal;

        setShowDropdown(false);

        const updatedNotes = notes.map((nt) => {
            if(nt.id === option.id){
            return {
                ...nt,
                refCount: nt.refCount + 1,
            };
            }
            if(nt.id === note.id){
            return {
                ...nt,
                value: newValue,
                refCount: nt.refCount + 1,
            };
            }
            return nt;
        });
        setNotes(updatedNotes);
        setAfterSelection(true);
    };

    const substituteVariables = (template) => {
        // Step 1: Parsing the Template Literal
        const placeholders = template.match(/\$\{([^}]+)\}/g);

        // Step 2: Variable Identification
        const variableNames = placeholders.map((placeholder) =>
        placeholder.slice(2, -1).trim()
        );

        // Step 3: Variable Resolution
        const variableValues = variableNames.map((id) => notes.filter(nt => nt.id === id)[0]);

        // Step 4: String Concatenation
        let substitutedString = template;
        for (let i = 0; i < placeholders.length; i++) {
        const placeholder = placeholders[i];
        const variableValue = variableValues[i];
        const coloredText = `<span style="color: blue;">${variableValue}</span>`;
        substitutedString = substitutedString.replace(placeholder, coloredText);
        }

        // Step 5: Resulting String
        return substitutedString;
    };


  return (
    <div>
      <div
        className="note"
        contentEditable
        onInput={handleOnChange}
        // onKeyDown={handleBackspace}
        style={{ position: 'relative' }}
        suppressContentEditableWarning={true}
        ref={noteRef}
      />
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: dropdownPosition.y,
            left: dropdownPosition.x,
            background: 'grey',
            border: '1px solid #ccc',
            padding: '5px',
            zIndex: 9999,
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notes.length > 0 && notes.map((option, indx) => {
                console.log(option);
                return (
                    <li
                        key={indx}
                        onClick={() => handleOptionSelect(option)}
                        style={{ cursor: 'pointer' }}
                    >
                        {option.value}
                    </li>
                )
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Note;