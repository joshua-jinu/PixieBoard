import { TOOL_LINE, TOOL_RECTANGLE, TOOL_TRIANGLE, TOOL_CIRCLE, TOOL_PENCIL, TOOL_ERASER, TOOL_TEXT} from "/js/static_tool_names.js"
import PixieBoard from '/js/static_whiteboard.js';


var pixieBoard = new PixieBoard("whiteboard");
pixieBoard.activeTool = TOOL_PENCIL;
pixieBoard.selectedColor = "#000000";
pixieBoard.lineWidth = 2;
pixieBoard.init();
var whiteboardInitialised = false; 

export const socket = io.connect('http://localhost:8000');
socket.emit('newClientJoined', "New Client has joined");

socket.on('currentState', data =>{
    if(data == "You are the only client"){
        whiteboardInitialised = true;
    }
    else{
        //procces the data
        console.log("data received");
        console.log("data:" + data);
        // pixieBoard.previousWhiteboardStack = data.previousWhiteboardStack;
        // pixieBoard.nextWhiteboardStack = data.nextWhiteboardStack;
        // var totalNoWhiteboard = data.previousWhiteboardStack.length + 1 + data.nextWhiteboardStack.length;
        // pixieBoard.whiteboard_no = totalNoWhiteboard;
        whiteboardInitialised = true;
        console.log("initiallised");
    }
});

socket.on('newClientJoined', data =>{
    //when you understand that a new client has joined, send the required data to the client(Using sendNewClient() function)
    console.log("sending data to new client");
    pixieBoard.sendNewClient();
});

socket.on('totalWhiteboards', data => {
    //get the total no of whiteboards that the other clients have and add that many whiteboards and go to the whiteboard that os currently in use
    var num = 1;
    while(num <= data[0]){
        pixieBoard.addWhiteboard();
        num += 1
    }
    while(pixieBoard.whiteboard_no > data[1]){
        pixieBoard.previousWhiteboard();
    }
    console.log("Total No of Whiteboards Received and Initiallised");
});



// socket.on('ImageData', initialiseWhiteboard);
// socket.on('currentState', initialiseWhiteboard);
socket.on(TOOL_PENCIL, drawData);
socket.on(TOOL_ERASER, eraseData);
socket.on('shapes', shapeData);
socket.on(TOOL_TEXT, textData);
socket.on('clearWhiteboard', clearCommand);
socket.on('undo', undoData);
socket.on('redo', redoData);
socket.on('addWhiteboard', data => {
    console.log(data);
    pixieBoard.addWhiteboard();
});
socket.on('previousWhiteboard', data =>{
    console.log(data);
    pixieBoard.previousWhiteboard();
});
socket.on('nextWhiteboard', data =>{
    console.log(data);
    pixieBoard.nextWhiteboard();
});

// function initialiseWhiteboard(data){
//     console.log(data);
//     if(WhiteboardInitialiseNo == 0){
//         pixieBoard.previousWhiteboardStack = data.previousWhiteboardStack;
//         pixieBoard.nextWhiteboardStack = data.nextWhiteboardStack;
//         var totalNoWhiteboard = data.previousWhiteboardStack.length + 1 + data.nextWhiteboardStack.length;
//         while(pixieBoard.total_no_whiteboard < totalNoWhiteboard){
//             pixieBoard.addWhiteboard();
//         }    
//         while(pixieBoard.whiteboard_no != data.currentWhiteboardNo){
//             pixieBoard.previousWhiteboard();
//         }
//         WhiteboardInitialiseNo += 1;
//         // pixieBoard.context.putImageData(data.imageData, 0, 0);
//         // console.log("imageData",data.imageData);
//         console.log('Whiteboard initiallised');
//     }
//     else{
//         console.log("Whiteboard already initiallised");
//     }
// }

function undoData(data){
    console.log(data);
    pixieBoard.undoCommand("socket");
}

function redoData(data){
    console.log(data);
    pixieBoard.redoCommand("socket");
}

function clearCommand(data){
    console.log("Received, Processing request");
    pixieBoard.clearBoard();
}

function drawData(data){
    console.log("Received, Processing request");
    var initialColor = pixieBoard.color;
    var initialTool = pixieBoard.tool;
    var initialLineWidth = pixieBoard.line_Width;
    pixieBoard.activeTool = TOOL_PENCIL;
    pixieBoard.selectedColor = data.color;
    pixieBoard.lineWidth = data.lineWidth;
    console.log("pencil iniciated");

    if(data.mouseDown == true) {
        pixieBoard.savedData = pixieBoard.context.getImageData(0,0,pixieBoard.whiteboard.clientWidth, pixieBoard.whiteboard.clientHeight);
        pixieBoard.context.beginPath();
        pixieBoard.context.moveTo(data.startPos.x, data.startPos.y); 
        if(pixieBoard.socketUndoStack.length >= pixieBoard.stackLimit) pixieBoard.socketUndoStack.shift();
        pixieBoard.socketUndoStack.push(pixieBoard.savedData);   
    }

    pixieBoard.drawPencilLine(data.startPos);
    //reset the initial values
    pixieBoard.activeTool = initialTool;
    pixieBoard.selectedColor = initialColor;
    pixieBoard.lineWidth = initialLineWidth;
}

function eraseData(data){
    console.log("Received, Processing request");
    var initialTool = pixieBoard.tool;
    var initialLineWidth = pixieBoard.line_Width;
    pixieBoard.activeTool = TOOL_ERASER;
    pixieBoard.lineWidth = data.lineWidth;

    if(data.mouseDown == true){
        pixieBoard.savedData = pixieBoard.context.getImageData(0,0,pixieBoard.whiteboard.clientWidth, pixieBoard.whiteboard.clientHeight);
        if(pixieBoard.socketUndoStack.length >= pixieBoard.stackLimit) pixieBoard.socketUndoStack.shift();
        pixieBoard.socketUndoStack.push(pixieBoard.savedData);   
    } 
    
    console.log("erasing");
    pixieBoard.context.clearRect(data.startPos.x, data.startPos.y, data.lineWidth, data.lineWidth);
    
    //reset the initial values
    pixieBoard.activeTool = initialTool;
    pixieBoard.lineWidth = initialLineWidth;   
}

function shapeData(data){
    console.log("Received, Processing request");
    if(data.mouseDown == false){
        var initialColor = pixieBoard.color;
        var initialTool = pixieBoard.tool;
        var initialLineWidth = pixieBoard.line_Width;
        pixieBoard.activeTool = data.shape;
        pixieBoard.selectedColor = data.color;
        pixieBoard.lineWidth = data.lineWidth;
        
        console.log("drawing shape");
        pixieBoard.drawShape(data.startPos, data.currentPos, pixieBoard.savedData);    
        
        //reset the initial values
        pixieBoard.activeTool = initialTool;
        pixieBoard.selectedColor = initialColor;
        pixieBoard.lineWidth = initialLineWidth;   
    }
    else if(data.mouseDown == true){
        pixieBoard.savedData = pixieBoard.context.getImageData(0,0,pixieBoard.whiteboard.clientWidth, pixieBoard.whiteboard.clientHeight);
        if(pixieBoard.socketUndoStack.length >= pixieBoard.stackLimit) pixieBoard.socketUndoStack.shift();
        pixieBoard.socketUndoStack.push(pixieBoard.savedData);  
    } 
}

function textData(data){
    console.log("Received text, Processing request");
    var initialTool = pixieBoard.tool;
    pixieBoard.activeTool = TOOL_TEXT;
    
    if(data.mouseDown == true){
        pixieBoard.savedData = pixieBoard.context.getImageData(0,0,pixieBoard.whiteboard.clientWidth, pixieBoard.whiteboard.clientHeight);
        if(pixieBoard.socketUndoStack.length >= pixieBoard.stackLimit) pixieBoard.socketUndoStack.shift();
        pixieBoard.socketUndoStack.push(pixieBoard.savedData);   
    }

    console.log('writing text');
    pixieBoard.text_count_reference = 0;
    pixieBoard.textDraw(data.startPos, data.text);

    //reset the initial values
    pixieBoard.activeTool = initialTool;
}


document.querySelectorAll("[data-command").forEach(
    tool => {

        tool.addEventListener("click", e => {
            let command = tool.getAttribute("data-command");

            if(command == 'undo'){
               pixieBoard.undoCommand('normal');
               if(pixieBoard.undoStack.length > 0) pixieBoard.send_data(undefined, undefined, undefined , undefined, undefined, undefined, undefined, "undo");
            }else if(command == "redo"){
                pixieBoard.redoCommand();
                if(pixieBoard.redoStack.length > 0) pixieBoard.send_data(undefined, undefined, undefined , undefined, undefined, undefined, undefined, "redo");
            }else if(command == 'export_whiteboard'){
                var whiteboard = document.getElementById("whiteboard");
                var image = whiteboard.toDataURL("image/png",1.0)
                .replace("image/png", "image/octet-stream");
                var link = document.createElement("a");
                link.download = "PixieBoard export.png";
                link.href = image;
                link.click();
            }else if(command == "clear_whiteboard"){
                pixieBoard.clearBoard();
                pixieBoard.send_data(undefined, undefined, undefined, undefined, undefined, undefined, undefined, command= 'clearWhiteboard');
            }
        });
    });


    document.querySelectorAll("[data-tool]").forEach(
        tool => {
            tool.addEventListener("click", e => {
                document.querySelector("[data-tool].active").classList.toggle("active");
                tool.classList.toggle("active");

                let selected_tool = tool.getAttribute("data-tool");
                pixieBoard.activeTool = selected_tool;
            });
        });


    document.querySelectorAll("[data-color]").forEach(
        color => {
            color.addEventListener("click", e=>{
                document.querySelector("[data-color].active").classList.toggle("active");
                color.classList.toggle("active");

                    let selectedcolor = color.getAttribute("data-color");
                    pixieBoard.selectedColor = selectedcolor;               
            });
        });


    document.querySelectorAll("[data-line-width]").forEach(
        line_size => {
            line_size.addEventListener("click", e=> {
                document.querySelector("[data-line-width].active").classList.toggle("active");
                line_size.classList.toggle("active");

                let linewidth = line_size.getAttribute("data-line-width");
                pixieBoard.lineWidth = linewidth;
            });
        });

    document.querySelectorAll("[data-upload-type").forEach(
        upload_type => {
            upload_type.addEventListener("click", e => {
                let file_type = upload_type.getAttribute("data-upload-type");
                let file_object = document.getElementById("file");
                console.log(file_object);

                if(file_type == "image"){
                    file_object.addEventListener("change", function(e){
                        if(e.target.files){
                            let file = e.target.files[0];
                            pixieBoard.uploadImage(file);
                    }});
                }else if(file_type == "pdf"){
                    file_object.addEventListener("change", function(e){
                        if(e.target.files){
                            let file = e.target.files[0];
                            pixieBoard.uploadPdf(file);
                    }});
                }
            });
        })

    document.querySelectorAll("[data-whiteboard-select").forEach(
        whiteboard_select_command => {
            whiteboard_select_command.addEventListener("click", event =>{
                let whiteboard_selected_command = whiteboard_select_command.getAttribute("data-whiteboard-select");

                if(whiteboard_selected_command == "add_whiteboard"){
                    pixieBoard.addWhiteboard();
                    if ((pixieBoard.previousWhiteboardStack.length + pixieBoard.nextWhiteboardStack.length) <= pixieBoard.whiteboardStackLimit) pixieBoard.send_data(undefined, undefined, undefined , undefined, undefined, undefined, undefined, "addWhiteboard");
                }else if(whiteboard_selected_command == "previous_whiteboard"){
                    pixieBoard.previousWhiteboard();
                    if(pixieBoard.previousWhiteboardStack.length > 0) pixieBoard.send_data(undefined, undefined, undefined , undefined, undefined, undefined, undefined, "previousWhiteboard");
                }else if(whiteboard_selected_command == "next_whiteboard"){
                    pixieBoard.nextWhiteboard();
                    if(pixieBoard.previousWhiteboardStack.length > 0) pixieBoard.send_data(undefined, undefined, undefined , undefined, undefined, undefined, undefined, "nextWhiteboard");
                }
            })
        })


    // document.querySelectorAll("[data-page-select").forEach(
    //     page_select_command => {
    //         page_select_command.addEventListener("click", event =>{
    //             let page_selected_command = page_select_command.getAttribute("data-page-select");

    //             if(page_selected_command == "previous_whiteboard"){
    //                 pixieBoard.previousPage();
    //             }else if(page_selected_command == "next_whiteboard"){
    //                 pixieBoard.nextPage();
    //             }
    //         })
    //     })
    
    