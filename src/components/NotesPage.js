import React, { startTransition, useEffect, useRef, useState } from "react";
// import Note from './Note';
import { Container, Typography, TextField, Button } from '@material-ui/core';

function NotesPage() {
    
    const getCursorPosition = (index) => {
        const currentRef = contentEditableRefs.current[index];
        if (currentRef) {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const clonedRange = range.cloneRange();
            clonedRange.selectNodeContents(currentRef);
            clonedRange.setEnd(range.endContainer, range.endOffset);
            const cursorPosition = clonedRange.toString().length;
            return cursorPosition;
          }
        }
        return 0;
    };
///////////////////////////////
    const [notes, setNotes] = useState([]);
    const handleAddNote = () => {
        const updatedNotes = [{
            id: crypto.randomUUID(),
            value: "",
            refPoints: [], //{x, y, refId}
            refCount: 0,
            showOptions: false,
            dropDownOptions: []
        }, ...notes];
        setNotes(updatedNotes)
        
    };
    const contentEditableRefs = useRef([]);
    useEffect(() => {
        contentEditableRefs.current = contentEditableRefs.current.slice(0, notes.length);
    }, [notes.length]);
    const handleContentEditableChange = (newValue, index) => {
        setNotes(prevValues => {
          const newValues = [...prevValues];
          newValues[index] = {...newValues[index], value: newValue, showOptions: false, dropDownOptions: []};
          return newValues;
        });
    };
    const handleContentEditableBlur = (index) => {
        const currentRef = contentEditableRefs.current[index];
        if (currentRef) {
          const newValue = currentRef.innerHTML;
          handleContentEditableChange(newValue, index);
        }
    };
    const createRefForIndex = (index) => {
        return (ref) => {
          contentEditableRefs.current[index] = ref;
        };
    };
    
    /////////////////////////////
    const [hashIndx, setHashIndx] = useState(null)
    const [hashEndIndx, setHashEndIndx] = useState(null)
    const handleOnChange = (e, indx) => {
        let curTxt = e.target.textContent;
        let curTrmTxt = curTxt.trim();
        let cursorPos = getCursorPosition(indx);
        if(hashIndx && curTxt[hashIndx - 1] !== '>'){
            setNotes(notes.map((note, idx) => idx === indx ? {...note, showOptions: false, dropDownOptions: []} : note));
            setHashIndx(null);
            setHashEndIndx(null);
            return;
        }
            //handle filtering options if flag is true
        if(notes[indx].showOptions){
            setHashEndIndx(cursorPos)
            let userInput = curTrmTxt.substring(hashIndx)
            console.log(userInput)
            let suggestedList = notes.filter((nt, idx) => indx !== idx && nt.value && nt.value.includes(userInput))
            setNotes(notes.map((note, idx) => idx === indx ? {...note, showOptions: true, dropDownOptions: suggestedList} : note));
            console.log("showing", cursorPos)
        }
        if(curTrmTxt[cursorPos - 2] === '<' && curTrmTxt[cursorPos - 1] === '>'){
            console.log('here');
            let suggestedList = notes.filter((nt, idx) => indx !== idx && nt.value)
            setNotes(notes.map((note, idx) => idx === indx ? {...note, showOptions: true, dropDownOptions: suggestedList} : note));
            setHashIndx(cursorPos);
            setHashEndIndx(cursorPos)
        }
    }
    const HtmlToText = (str) => {
        let tmpDom = document.createElement('div');
        tmpDom.innerHTML = str;
        return tmpDom.textContent;
    }
    // const processVal = (content, refPoints) => {
    //     let textContent = HtmlToText(content);
    //     let newContent = '';
    //     console.log(refPoints)
    //     for(let i = 0 ; i < textContent.length; i++){
    //         if(refPoints.filter(p => p[0] === i).length > 0)
    //             newContent += '<span class="note-entity" contenteditable="false">'
    //         newContent += textContent[i];
    //         if(refPoints.filter(p => p[1] === i).length > 0)
    //             newContent += '</span>'
            
    //     }
    //     return newContent
    // }
    // function setCaret(pos, noteIndx) {
    //     var el = document.getElementById(`note-${noteIndx}`)
    //     var range = document.createRange()
    //     var sel = window.getSelection()
        
    //     range.setStart(el.childNodes[0], pos)
    //     range.collapse(true)
        
    //     sel.removeAllRanges()
    //     sel.addRange(range)
    // }
    const handleSelectOption = (e, option, optionVal, note, noteIndx) => {
        e.preventDefault();
        // let curTxt = contentEditableRefs.current[noteIndx].textContent;
        // let curTrmTxt = curTxt.trim();
        let optionIndx = notes.findIndex(nt => nt.id === option.id);
        // console.log(notes[noteIndx]);
        // update the value => done
        // curTxt = HtmlToText(curTxt)
        // let oldLhsVal = curTxt.substring(0, hashIndx - 2)
        var editableDiv = document.getElementById(`note-${noteIndx}`);
        // setCaret(hashIndx - 2, noteIndx)
        console.log(hashIndx)
        let deleteExecNo = hashEndIndx - hashIndx + 2;
        while(deleteExecNo--)
            document.execCommand('delete')
        /////////////////////////////////////////////////////////
        var selection = window.getSelection();

        if (!selection.rangeCount) return;

        var range = selection.getRangeAt(0);
        var newNode = document.createElement('span');
        newNode.textContent = `<>${optionVal}`;
        newNode.className = "note-entity";
        newNode.id = option.id;
        newNode.contentEditable = false
        range.deleteContents();
        range.insertNode(newNode);
        // Set the cursor to the end of the newly inserted node
        range.setStartAfter(newNode);
        range.setEndAfter(newNode);
        selection.removeAllRanges();
        selection.addRange(range);

        editableDiv.focus();
        // push the st and ed of the ref to the refPOints array => done
        // update refCount of the corresponding referred note => done
        setNotes(prevValues => {
            const newValues = [...prevValues];
            newValues[noteIndx] = {
                ...newValues[noteIndx], 
                value: editableDiv.innerHTML,
                showOptions: false, 
                dropDownOptions: []
            };
            newValues[optionIndx] = {
                ...newValues[optionIndx], 
                refCount: newValues[optionIndx].refCount + 1
            }
            return newValues;
        });
        //set the cursor after thew new component
        // placeCaretAtEnd(document.getElementById(`note-${noteIndx}`));
    };
    const handleOnKeyDown = (e, index) => {
        // const focusNode = selection.focusNode;
        if(e.key === 'Backspace'){
            const selection = window.getSelection();
            let cursorPos = getCursorPosition(index)
            const editableDiv = document.getElementById(`note-${index}`);
            const childNodes = editableDiv.childNodes;
            let childNodesEnds = [];
            for (let i = 0; i < childNodes.length; i++) {
                const childNode = childNodes[i];
                if (childNode.nodeName === 'SPAN') {
                    const range = document.createRange();
                    range.setStart(editableDiv, 0);
                    range.setEndAfter(childNode);
                    // const endPosition = range.toString().length;
                    const startPosition = range.toString().length - childNode.textContent.length;
                    const endPosition = startPosition + childNode.textContent.length;
                    childNodesEnds.push({nd: childNode, startPosition, endPosition})
                    // console.log(`End position of child node ${i}: ${endPosition}`);
                }
            }
            if(childNodesEnds.some(nd => nd.endPosition === cursorPos)){
                e.preventDefault()
                console.log('got it')
                let targetChildNode = childNodesEnds.filter(nd => nd.endPosition === cursorPos)[0].nd;
                const range = document.createRange();
                range.setStart(targetChildNode, 0);
                range.setEndAfter(targetChildNode);

                const selection = window.getSelection();
                const selectedRange = selection.getRangeAt(0);

                const isRangeSelected = range.compareBoundaryPoints(Range.START_TO_START, selectedRange) === 0 &&
                range.compareBoundaryPoints(Range.END_TO_END, selectedRange) === 0;
                if(isRangeSelected){
                    console.log('selected already');
                    let idToBeDecreased = targetChildNode.id;
                    setNotes(prevValues => {
                        const newValues = prevValues.map(val => {
                            if(val.id === idToBeDecreased){
                                return {
                                    ...val,
                                    refCount: val.refCount - 1
                                }
                            }
                            return val;
                        });
                        return newValues;
                    });
                    targetChildNode.remove();

                }else{
                    console.log('going to select')
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
            console.log(childNodesEnds, cursorPos)
        }

    }
   
    
    
    useEffect(() => {
        console.log("notes => ", notes)
    }, [notes])
    
    return (
        <div>
            <Typography variant="h2" component="h1" align="center">
                Notes Page
            </Typography>
            <Button onClick={handleAddNote} children={'add'} />
            <div>
                {notes.map((note, index) => (
                    <div key={index}>
                        <div
                            spellcheck="false"
                            className="note"
                            id={`note-${index}`}
                            contentEditable
                            dangerouslySetInnerHTML={{ __html: note.value}}
                            onBlur={() => handleContentEditableBlur(index)}
                            onInput={(e) => handleOnChange(e, index)}
                            onKeyDown={(e) => handleOnKeyDown(e, index)}
                            ref={createRefForIndex(index)}
                        />
                        <div>
                            {note.showOptions && note.dropDownOptions.map((option, indx) => {
                                let optionVal = HtmlToText(option.value)
                                return (
                                    <button key={option.id} onMouseDown={(e) => handleSelectOption(e, option, optionVal, note, index)}>
                                        {optionVal}
                                    </button>
                                )
                            }
                            )}
                        </div>
                        <span style={{
                            float: 'right',
                            padding: '5px',
                            fontSize: '11px',
                        }}>{note.refCount}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
  
  export default NotesPage;