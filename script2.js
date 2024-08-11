function changeSrc() {
    if (document.getElementById("poster1button").checked) {
        document.getElementById("poster").src = "https://i.ibb.co/2YzpY9v/20240530-193537.jpg";
    } else if (document.getElementById("poster2button").checked) {
        document.getElementById("poster").src = "https://i.ibb.co/zrJMsVY/20240530-194859.jpg";
    }
    saveState();
}

function toggleTable(tableId, buttonId) {
    var table = document.getElementById(tableId);
    var button = document.getElementById(buttonId);
    if (table.style.display === "none") {
        table.style.display = "table";
        button.innerHTML = "⛔️";
    } else {
        table.style.display = "none";
        button.innerHTML = "️️👁";
    }
}

const dbName = 'gameData';
const dbVersion = 1;

let db;

function openDB() {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const characterStore = db.createObjectStore('characters', { keyPath: 'id' });
        const synopsisStore = db.createObjectStore('synopses', { keyPath: 'id' });
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        loadState();
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.error);
    };
}

function deleteElementFromDB(elementId, type) {
    const transaction = db.transaction(['characters', 'synopses'], 'readwrite');
    const characterStore = transaction.objectStore('characters');
    const synopsisStore = transaction.objectStore('synopses');
    
    if (type === 'character') {
      characterStore.delete(elementId);
      let previousPosition = -1;
    
      characters.forEach(character => {
          if (character.position !== previousPosition + 1) {
              character.position = previousPosition + 1;
          }
          console.log(character.position);
          previousPosition = character.position;
      });
    } else if (type === 'synopsis') {
      synopsisStore.delete(elementId);
    }
    transaction.oncomplete = function() {
        console.log(type + ' deleted from IndexedDB');
    };

    transaction.onerror = function(event) {
        console.error('IndexedDB transaction error:', event.target.error);
    };
}

let characters = [];
let synopses = [];
const cells = [];
let editSynopsisBtn;
let addRowBtn;
let editButton;

document.addEventListener('DOMContentLoaded', () => {
    openDB();
    loadTitle();
    loadCellState();
    editButton = document.getElementById('edit-infobox');
    editSynopsisBtn = document.getElementById('edit-synopsis-btn');
    addRowBtn = document.getElementById('add-character-btn');
    document.getElementById('add-info-btn').addEventListener('click', generateInfoCell);
    addRowBtn.addEventListener('click', generateRow);
    document.querySelector('.add-text-btn').addEventListener('click', generateText);
    document.querySelector('.add-img-btn').addEventListener('click', generateImage);
    editButton.addEventListener('click', editPage);
    document.getElementById('edit-synopsis-btn').addEventListener('click', editAllSynopsisText);
    document.getElementById('table1').addEventListener('click', handleSynopsisClick);
    document.getElementById('table1').addEventListener('change', handleSynopsisChange);
    document.getElementById('info-list').addEventListener('change', handleCellChange);
    document.getElementById('table-body').addEventListener('click', handleTableClick);
    document.getElementById('table-body').addEventListener('change', handleTableChange);
});

function generateInfoCell() {
    const template = document.getElementById('info-template').content.cloneNode(true);
    const newId = Date.now();

    const newCell = {
        id: newId,
        text1: 'Write here',
        text2: 'Write here'
    };
    cells.push(newCell);
    
    updateCell(template, newCell);
    document.getElementById('info-list').appendChild(template);
    saveState();
}

function updateCell(template, cell) {
    template.querySelector('.info-title').setAttribute('data-index', cell.id);
    template.querySelector('.info-title').textContent = cell.text1;
    template.querySelector('.info-input').value = cell.text1;
    template.querySelector('.value-cell').textContent = cell.text2;
    template.querySelector('.value-input').value = cell.text2;
}

function editPage() {
    const controlRoom = document.querySelectorAll('.control-room');
    const title = document.getElementById('title');
    const introText = document.getElementById('intro');
    const titleInput = document.getElementById('title-input');
    const introInput = document.getElementById('intro-input');
    const editMode = editButton.textContent === '✏️';
    if (db) {
        if (editMode) {
            controlRoom.forEach(room => {
                room.style.display = 'block';
            });
            editSynopsisBtn.style.display = 'block';
            titleInput.value = title.textContent;
            introInput.value = introText.textContent;
            titleInput.style.display = 'inline';
            introInput.style.display = 'inline';
            title.style.display = 'none';
            introText.style.display = 'none';
            addRowBtn.style.display = 'block';
            editButton.textContent = '✔️';
        } else {
            controlRoom.forEach(room => {
                room.style.display = 'none';
            });
            editSynopsisBtn.style.display = 'none';
            title.textContent = titleInput.value;
            introText.textContent = introInput.value;
            titleInput.style.display = 'none';
            introInput.style.display = 'none';
            title.style.display = 'block';
            introText.style.display = 'block';
            addRowBtn.style.display = 'none';
            editButton.textContent = '✏️';
        }
        
        characterEdit(editMode);
        editInfoBox(editMode);
    }
}

function characterEdit(editMode) {
    const characterTemplate = document.querySelectorAll('.character-wrapper');
    
    characterTemplate.forEach(template => {
        let characterEditMode = template.querySelector('.character-name');
        let characterName = template.querySelector('.character-name');
        let characterBio = template.querySelector('.character-bio-text');
        let characterNameInput = template.querySelector('.name-input');
        let characterBioInput = template.querySelector('.bio-input');
        let charControls = template.querySelector('.character-name-controls');
        
        if (editMode) {
            characterName.style.display = 'none';
            characterBio.style.display = 'none';
            charControls.style.display = 'block';
            characterNameInput.value = characterName.textContent;
            characterBioInput.value = characterBio.textContent;
            characterNameInput.style.display = 'inline';
            characterBioInput.style.display = 'inline';
        } else {
            const index = template.getAttribute('data-index');
            const character = characters.find(char => char.id == index);
            characterNameInput.style.display = 'none';
            characterBioInput.style.display = 'none';
            charControls.style.display = 'none';
            
            if (characterNameInput.value.trim()) {
                character.name = characterNameInput.value;
                characterName.textContent = characterNameInput.value;
            }
            
            if (characterBioInput.value.trim()) {
                character.bio = characterBioInput.value;
                characterBio.textContent = characterBioInput.value;
            }
            
            characterName.style.display = 'block';
            characterBio.style.display = 'block';
        }
    });
}

function editInfoBox(editMode) {
    const infoWrappers = document.querySelectorAll('.info-wrapper');
    
    infoWrappers.forEach(info => {
        const infoTitle = info.querySelector('.info-title');
        const infoInput = info.querySelector('.info-input');
        const valueCell = info.querySelector('.value-cell');
        const valueInput = info.querySelector('.value-input');
        
        if (editMode) {
            infoTitle.style.display = 'none';
            valueCell.style.display = 'none';
            infoInput.value = infoTitle.textContent;
            valueInput.value = valueCell.textContent;
            infoInput.style.display = 'inline';
            valueInput.style.display = 'inline';
        } else {
            const index = infoTitle.getAttribute('data-index');
            const cell = cells.find(el => el.id == index);
            cell.text1 = infoInput.value;
            cell.text2 = valueInput.value;
            if (!infoInput.value.trim() && !valueInput.value.trim()) {
                const wrapper = infoInput.closest('.info-wrapper');
                wrapper.remove();
                const cellIndex = cells.findIndex(el => el.id == index);
                cells.splice(cellIndex, 1);
            } else {
                infoTitle.style.display = 'inline';
                valueCell.style.display = 'inline';
                infoTitle.textContent = infoInput.value;
                valueCell.textContent = valueInput.value;
                infoInput.style.display = 'none';
                valueInput.style.display = 'none';
            }
        }
    });
    saveState();
}

function generateText() {
    const template = document.getElementById('Synopsis-text-template').content.cloneNode(true);
    const newId = Date.now();

    const newText = {
        id: newId,
        text: 'Write here'
    };
    synopses.push(newText);

    updateText(template, newText);
    document.getElementById('table1').appendChild(template);
    saveState();
}

function generateImage() {
    const template = document.getElementById('synopsis-img-template').content.cloneNode(true);
    const newId = Date.now();

    const newImage = {
        id: newId,
        imgSrc: 'https://via.placeholder.com/100'
    };
    synopses.push(newImage);

    updateImage(template, newImage);
    document.getElementById('table1').appendChild(template);
    saveState();
}

function handleSynopsisClick(event) {
    const target = event.target;
    if (target.classList.contains('change-img-btn')) {
        const input = target.closest('.synopsis-img-wrapper').querySelector('.change-img');
        input.click();
    } else if (target.classList.contains('delete-img-btn')) {
        const wrapper = target.closest('.synopsis-img-wrapper');
        deleteImage(wrapper);
    }
}

function handleSynopsisChange(event) {
    const target = event.target;
    const index = target.closest('.synopsis-img-wrapper').querySelector('img').dataset.index;
    const synopsisElement = synopses.find(el => el.id == index);

    if (target.classList.contains('change-img')) {
        loadImage(event, synopsisElement, 'synopsis');
    } else if (target.classList.contains('synopsis-text-input')) {
        const textElement = target.closest('.synopsis-wrapper').querySelector('.synopsis-text');
        synopsisElement.text = target.value;
        textElement.textContent = target.value;
        saveState();
    }
}

function handleCellChange(event) {
    const target = event.target;
    const index = target.closest('.info-title').getAttribute('data-index');
    const cell = cells.find(el => el.id == index);

    if (target.classList.contains('info-input')) {
        cell.text1 = target.value;
        target.closest('.info-wrapper').querySelector('.info-cell').textContent = target.value;
    } else if (target.classList.contains('value-input')) {
        cell.text2 = target.value;
        target.closest('.value-wrapper').querySelector('.value-cell').textContent = target.value;
    }
    saveState();
}

function updateText(template, textElement) {
    template.querySelector('.synopsis-text').setAttribute('data-index', textElement.id);
    template.querySelector('.synopsis-text').textContent = textElement.text;
    template.querySelector('.synopsis-text-input').value = textElement.text;
}

function updateImage(template, imageElement) {
    const img = template.querySelector('img');
    img.setAttribute('data-index', imageElement.id);
    img.src = imageElement.imgSrc;
}

function editAllSynopsisText() {
    const textWrappers = document.querySelectorAll('.synopsis-wrapper');
    const imgWrappers = document.querySelectorAll('.synopsis-img-wrapper');
    const addTextBtn = document.querySelector('.add-text-btn');
    const addImageBtn = document.querySelector('.add-img-btn');
    const editSynopsisMode = editSynopsisBtn.textContent === '✏️';
    
    if (editSynopsisMode) {
        addTextBtn.style.display = 'block';
        addImageBtn.style.display = 'block';
        editSynopsisBtn.textContent = '✔️';
    } else {
        addTextBtn.style.display = 'none';
        addImageBtn.style.display = 'none';
        editSynopsisBtn.textContent = '✏️';
    }
    
    textWrappers.forEach(wrapper => {
        const textElement = wrapper.querySelector('.synopsis-text');
        const inputElement = wrapper.querySelector('.synopsis-text-input');

        if (editSynopsisMode) {
            inputElement.style.display = 'block';
            inputElement.value = textElement.textContent;
            textElement.style.display = 'none';
        } else {
            const index = textElement.getAttribute('data-index');
            const synopsisElement = synopses.find(el => el.id == index);
            synopsisElement.text = inputElement.value;
            textElement.textContent = inputElement.value;

            if (!inputElement.value.trim()) {
                const wrapper = inputElement.closest('.synopsis-wrapper');
                wrapper.remove();
                deleteElementFromDB(synopsisElement.id, 'synopsis')
                const synopsisIndex = synopses.findIndex(el => el.id == index);
                if (synopsisIndex !== -1) {
                    synopses.splice(synopsisIndex, 1);
                }
            } else {
                textElement.textContent = inputElement.value;
                inputElement.style.display = 'none';
                textElement.style.display = 'block';
            }
        }
    });
    imgWrappers.forEach(wrapper => {
        const changeImgBtn = wrapper.querySelector('.change-img-btn');
        const deleteImgBtn = wrapper.querySelector('.delete-img-btn');
        
        if (editSynopsisMode) {
          changeImgBtn.style.display = 'block';
          deleteImgBtn.style.display = 'block';
        } else {
          changeImgBtn.style.display = 'none';
          deleteImgBtn.style.display = 'none';
        }
    });
    saveState();
}

function deleteImage(wrapper) {
    const imgElement = wrapper.querySelector('img');
    const index = imgElement.getAttribute('data-index')
    const image = synopses.find(img => img.id == index);
    
    wrapper.remove();
    
    synopses.splice(synopses.indexOf(image), 1);
    deleteElementFromDB(image.id, 'synopsis');
}

function handleTableClick(event) {
    const target = event.target;
    const row = target.closest('tr');
    const index = row ? row.dataset.index : null;
    const character = characters.find(char => char.id == index);

    if (target.classList.contains('upload-img1-btn')) {
        row.querySelector('.upload-img').setAttribute('data-type', 'character');
        row.querySelector('.upload-img').click();
    } else if (target.classList.contains('upload-img2-btn')) {
        row.querySelector('.upload-img').setAttribute('data-type', 'inspiration');
        row.querySelector('.upload-img').click();
    } else if (target.classList.contains('move-up-btn')) {
        moveRowUp(row);
    } else if (target.classList.contains('move-down-btn')) {
        moveRowDown(row);
    } else if (target.classList.contains('see-more-btn')) {
        toggleBio(row);
    } else if (target.classList.contains('delete-btn')) {
        deleteRow(row, character);
    }
}

function handleTableChange(event) {
    const target = event.target;
    const row = target.closest('tr');
    const index = row ? row.dataset.index : null;
    const character = characters.find(char => char.id == index);

    if (target.classList.contains('upload-img')) {
        const type = target.getAttribute('data-type');
        loadImage(event, character, type);
    } else if (target.classList.contains('role-select')) {
        character.role = target.value;
    } else if (target.classList.contains('playable-select')) {
        character.playable = target.value;
    }
    saveState();
}

function generateRow() {
    const template = document.getElementById('character-template').content.cloneNode(true);
    const newId = Date.now();
    const newPosition = characters.length ? characters[characters.length - 1].position + 1 : 0;

    const newCharacter = {
        id: newId,
        name: 'New Character ' + newPosition,
        bio: 'New character bio goes here...',
        imgSrc: 'https://via.placeholder.com/100',
        inspirationImgSrc: 'https://via.placeholder.com/100',
        role: 'Unknown',
        playable: 'Yes',
        position: newPosition
    };
    characters.push(newCharacter);

    updateRow(template, newCharacter);
    document.getElementById('table-body').appendChild(template);
    saveState();
}

function updateRow(template, character) {
    template.querySelector('.character-wrapper').setAttribute('data-index', character.id);
    template.querySelector('.character-name').textContent = character.name;
    template.querySelector('.character-bio-text').textContent = character.bio;
    template.querySelector('.character-img').src = character.imgSrc;
    template.querySelector('.inspiration-img').src = character.inspirationImgSrc;
    template.querySelector('.role-select').value = character.role;
    template.querySelector('.playable-select').value = character.playable;
}

function loadImage(event, element, type) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        if (type === 'character') {
            element.imgSrc = e.target.result;
            const row = document.querySelector(`tr[data-index="${element.id}"]`);
            row.querySelector('.character-img').src = element.imgSrc;
        } else if (type === 'inspiration') {
            element.inspirationImgSrc = e.target.result;
            const row = document.querySelector(`tr[data-index="${element.id}"]`);
            row.querySelector('.inspiration-img').src = element.inspirationImgSrc;
        } else if (type === 'synopsis') {
            element.imgSrc = e.target.result;
            const imgElement = document.querySelector(`img[data-index="${element.id}"]`);
            imgElement.src = element.imgSrc;
        }
    };
    reader.readAsDataURL(file);
}

function moveRowUp(row) {
    const previousRow = row.previousElementSibling;
    if (previousRow) {
        const currentIndex = Number(row.dataset.index);
        const previousIndex = Number(previousRow.dataset.index);

        const currentCharacter = characters.find(char => char.id === currentIndex);
        console.log(currentCharacter.position);
        const previousCharacter = characters.find(char => char.id === previousIndex);
        
          const currentPosition = currentCharacter.position;
          currentCharacter.position = previousCharacter.position;
          previousCharacter.position = currentPosition;
    
          row.parentNode.insertBefore(row, previousRow);
          saveState();
    }
}

function moveRowDown(row) {
    const nextRow = row.nextElementSibling;
    if (nextRow) {
        const currentIndex = Number(row.dataset.index);
        const nextIndex = Number(nextRow.dataset.index);

        const currentCharacter = characters.find(char => char.id === currentIndex);
        const nextCharacter = characters.find(char => char.id === nextIndex);
        
        const currentPosition = currentCharacter.position;
        currentCharacter.position = nextCharacter.position;
        nextCharacter.position = currentPosition;
    
        row.parentNode.insertBefore(nextRow, row);
        saveState();
    }
}

function toggleBio(row) {
    const bioElement = row.querySelector('.character-bio');
    const btnElement = row.querySelector('.see-more-btn');

    if (bioElement.style.maxHeight) {
        bioElement.style.maxHeight = null;
        btnElement.textContent = 'show more';
    } else {
        bioElement.style.maxHeight = bioElement.scrollHeight + 'px';
        btnElement.textContent = 'show less';
    }
}

function deleteRow(row, character) {
    if (confirm('Are you sure you want to delete this character?')) {
        row.remove();
        characters.splice(characters.indexOf(character), 1);
        deleteElementFromDB(character.id, 'character');
    }
}

function loadCellState() {
    const savedCells = JSON.parse(localStorage.getItem('cells'));
    if (savedCells) {
        savedCells.forEach(cell => {
            const template = document.getElementById('info-template').content.cloneNode(true);
            updateCell(template, cell);
            const cellWrapper = template.querySelector('.info-wrapper')
            cellWrapper.querySelector('.info-title').style.display = 'inline';
            cellWrapper.querySelector('.info-input').style.display = 'none';
            cellWrapper.querySelector('.value-cell').style.display = 'inline';
            cellWrapper.querySelector('.value-input').style.display = 'none';
            document.getElementById('info-list').appendChild(template);
        });
        cells.push(...savedCells);
    }
}

function loadTitle() {
    const savedTitle = localStorage.getItem('title');
    const savedIntro = localStorage.getItem('intro');
    
    if (savedTitle) {
        document.getElementById('title').textContent = savedTitle;
    }
    
    if (savedIntro) {
        document.getElementById('intro').textContent = savedIntro;
    }
}

function loadState() {
    const transaction = db.transaction(['characters', 'synopses'], 'readonly');
    const characterStore = transaction.objectStore('characters');
    const synopsisStore = transaction.objectStore('synopses');

    characterStore.getAll().onsuccess = function(event) {
        characters = event.target.result;
        characters.sort((a, b) => a.position - b.position);
        
        characters.forEach(character => {
            const template = document.getElementById('character-template').content.cloneNode(true);
            updateRow(template, character);
            const editorWrapper = template.querySelector('.character-name-controls');
            editorWrapper.style.display = 'none';
            document.getElementById('table-body').appendChild(template);
        });
    };

    synopsisStore.getAll().onsuccess = function(event) {
        synopses = event.target.result;
        synopses.forEach(element => {
            const template = element.text ? document.getElementById('Synopsis-text-template').content.cloneNode(true) : document.getElementById('synopsis-img-template').content.cloneNode(true);
            if (element.text) {
                updateText(template, element);
                const synopsisWrapper = template.querySelector('.synopsis-wrapper');
                synopsisWrapper.querySelector('.synopsis-text').style.display = 'block';
                synopsisWrapper.querySelector('.synopsis-text-input').style.display = 'none';
                document.getElementById('table1').appendChild(template);
            } else if (element.imgSrc) {
                updateImage(template, element);
                document.getElementById('table1').appendChild(template);
            }
        });
    };
}

function saveState() {
    localStorage.setItem('title', document.getElementById('title').textContent);
    localStorage.setItem('intro', document.getElementById('intro').textContent);
    localStorage.setItem('cells', JSON.stringify(cells));
    const transaction = db.transaction(['characters', 'synopses'], 'readwrite');
    const characterStore = transaction.objectStore('characters');
    const synopsisStore = transaction.objectStore('synopses');

    characters.forEach(character => characterStore.put(character));
    synopses.forEach(synopsis => synopsisStore.put(synopsis));

    transaction.oncomplete = function() {
        console.log('Data saved to IndexedDB');
    };

    transaction.onerror = function(event) {
        console.error('IndexedDB transaction error:', event.target.error);
    };
}

function clearSavedState() {
    if (confirm('Are you sure you want to delete the saved file?')) {
        localStorage.removeItem('title');
        localStorage.removeItem('cells');
        const transaction = db.transaction(['characters', 'synopses'], 'readwrite');
        const characterStore = transaction.objectStore('characters');
        const synopsisStore = transaction.objectStore('synopses');

        characterStore.clear();
        synopsisStore.clear();

        transaction.oncomplete = function() {
            console.log('Data cleared from IndexedDB');
            location.reload();
        };

        transaction.onerror = function(event) {
            console.error('IndexedDB transaction error:', event.target.error);
        };
    }
}