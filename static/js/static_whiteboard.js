import { TOOL_LINE, TOOL_RECTANGLE, TOOL_TRIANGLE, TOOL_CIRCLE, TOOL_PENCIL, TOOL_ERASER, TOOL_TEXT} from "/js/static_tool_names.js";
import {getMouseCoordsOnWhiteboard, radiusCalculate} from '/js/utility.js';
import {socket} from '/js/main_whiteboard.js';


export default class PixieBoard{
    constructor(canvasId){
        this.whiteboard = document.getElementById(canvasId);
        this.context = whiteboard.getContext("2d");
        this.context.lineCap = "round";
        this.context.lineJoin = "round";
        this.savedData = this.context.getImageData(0,0,this.whiteboard.clientWidth, this.whiteboard.clientHeight);
        this.undoStack = [];
        this.redoStack = [];
        this.stackLimit = 10;
        this.socketUndoStack = [];
        this.socketRedoStack = [];
        this.previousWhiteboardStack = [];
        this.nextWhiteboardStack = [];
        this.whiteboardStackLimit = 20;
        this.whiteboard_no_tag = document.getElementById("whiteboard_no");
        this.total_no_whiteboard = 1;
        this.whiteboard_no = 1;
        this.next_whiteboard_btn = document.getElementById("next_whiteboard");
        this.add_whiteboard_btn  = document.getElementById("add_whiteboard");
        this.text_count_reference = 1;
        this.total_no_pages = 1;
        this.text_input_div = document.getElementById("text_inputs");
        this.text_input = document.createElement("input");
        this.text_input.type = "text";
        this.text_input.className = "text_input";
        this.text_input.placeholder = "Enter text...";
        this.text_input.style.cssText = "font-size: 20px; position: absolute; display: none; width: 300px; border-width:0px; border:none; outline: none;";
        this.text_input_div.appendChild(this.text_input);
    }
    
    sendNewClient(){
        this.currentWhiteboardData = this.context.getImageData(0,0,this.whiteboard.clientWidth, this.whiteboard.clientHeight);
        // var previousStack = this.previousWhiteboardStack;
        // previousStack.unshift(this.currentWhiteboardData);
        // var data = {
        //     previousWhiteboardStack: this.previousWhiteboardStack,
        //     nextWhiteboardStack: this.nextWhiteboardStack,
        //     currentWhiteboardNo: this.whiteboard_no
        // }
        var totalWhiteboard = this.previousWhiteboardStack.length + this.nextWhiteboardStack.length;
        socket.emit('totalWhiteboards', [totalWhiteboard, this.whiteboard_no]);
    }

    send_data(tool= this.tool, startPos = {}, lineWidth= this.line_Width, color="#000000",mouseDown = false, currentPos = {}, text= '-', command= '-', file= '-'){
        if(command == '-'){
            switch(tool){
                case TOOL_PENCIL:
                    var data = {
                        startPos: startPos,
                        lineWidth: lineWidth,
                        color: color,
                        mouseDown: mouseDown
                    };
                    socket.emit(TOOL_PENCIL, data);
                    console.log("Draw data initiated");
                    break;
                case TOOL_ERASER:
                    var data = {
                        startPos: startPos,
                        lineWidth: lineWidth,
                        mouseDown: mouseDown
                    };
                    socket.emit(TOOL_ERASER, data);
                    console.log("Eraser data initiated");
                    break;
                case TOOL_LINE:
                case TOOL_RECTANGLE:
                case TOOL_TRIANGLE:
                case TOOL_CIRCLE:
                    var data = {
                        startPos: startPos,
                        lineWidth: lineWidth,
                        color: color,
                        currentPos: currentPos,
                        shape: tool,
                        mouseDown: mouseDown
                    };
                    socket.emit('shapes', data);
                    console.log("Shape data initiated");
                    break;
                case TOOL_TEXT:
                    var data = {
                        startPos: startPos,
                        text: text,
                        mouseDown: mouseDown
                    };
                    socket.emit(TOOL_TEXT, data);
                    console.log("Text data initiated");
                    break;
                default:
                    break;
            }
        }
        else if(command != '-'){
            switch(command){
                case 'clearWhiteboard':
                    var data = {
                        command: 'clearWhiteboard'
                    }
                    socket.emit('clearWhiteboard', data);
                    console.log("Clear Whiteboard initiated");
                    break;
                case 'undo':
                    var data = {
                        command: command
                    }
                    socket.emit('undo', data);
                    console.log("Undo data initiated");
                    break;
                case 'redo':
                    var data = {
                        command: command
                    }
                    socket.emit('redo', data);
                    console.log("Redo data initiated");
                    break;
                case 'addWhiteboard':
                    var data = {
                        command: command
                    }
                    socket.emit('addWhiteboard', data);
                    console.log("addWhiteboard data initiated");
                    break;
                case 'previousWhiteboard':
                    var data = {
                        command: command
                    }
                    socket.emit('previousWhiteboard', data);
                    console.log("previousWhiteboard data initiated");
                    break;
                case 'nextWhiteboard':
                    var data = {
                        command: command
                    }
                    socket.emit('nextWhiteboard', data);
                    console.log("nextWhiteboard data initiated");
                    break;
            }
        }
        console.log("sent");
    }

    set activeTool(tool){
        this.tool = tool;
    }

    set selectedColor(color){
        this.color = color;
        // if(color == "galaxy_gradient"){
        //     console.log("galaxy mode");
        //     this.R = 0;
        //     this.G = 7;
        //     this.B = 111;
        //     this.context.strokeStyle =   'rgb('+ this.R +', '+ this.G +', '+ this.B +')';
        //     // 	(0,7,111)
        //     // 	(68,0,139)
        //     // 	(159,69,176)
        //     // 	(229,78,208)
        //     // 	(255,228,242)
        // }
        // else{}
            this.context.strokeStyle = this.color;
    }

    set lineWidth(linewidth){
        this.line_Width = linewidth;
        this.context.lineWidth = this.line_Width;
    }
    
    init(){
        this.whiteboard.onmousedown = mouse_event => this.onMouseDown(mouse_event);
    }

    onMouseDown(mouse_event){
        this.savedData = this.context.getImageData(0,0,this.whiteboard.clientWidth, this.whiteboard.clientHeight);
        
        if(this.undoStack.length >= this.stackLimit) this.undoStack.shift();
        this.undoStack.push(this.savedData);    
        
        this.whiteboard.onmousemove = mouse_event => this.onMouseMove(mouse_event);
        document.onmouseup = mouse_event => this.onMouseUp(mouse_event);
        
        this.startPosition = getMouseCoordsOnWhiteboard(mouse_event, this.whiteboard);
        
        if(this.tool == TOOL_PENCIL){
            this.context.beginPath();
            this.context.moveTo(this.startPosition.x, this.startPosition.y);
            this.drawPencilLine(this.startPosition);  
            this.send_data(this.tool, this.startPosition, this.line_Width, this.color, true);            
        }

        if(this.tool == TOOL_ERASER){
            this.context.clearRect(this.startPosition.x, this.startPosition.y, this.line_Width, this.line_Width);
            this.send_data(this.tool, this.startPosition, this.line_Width, undefined, true);
        }

        if(this.tool == TOOL_TEXT){
            this.textInput(this.startPosition);
        }

        if(this.tool == TOOL_TRIANGLE || this.tool == TOOL_RECTANGLE || this.tool == TOOL_LINE || this.tool == TOOL_CIRCLE){
            this.send_data(this.tool, this.startPosition, this.line_Width, this.color, true);
        }
                
        
        if(this.tool != TOOL_TEXT && this.text_input.value != "" &&  this.text_input.style.display == "block"){
            this.textDraw(this.textStartPos, this.text_input.value);
            this.send_data(this.tool, this.textStartPos, this.line_Width , this.color, true, undefined, this.text_input.value);
        }
    }

    onMouseMove(mouse_event){
        this.currentPosition = getMouseCoordsOnWhiteboard(mouse_event, this.whiteboard);  
    //     if(this.color == "galaxy_gradient"){
    //         console.log("mouseDown galaxy called");
    //         if(this.R < 255){
    //             this.R++;
    //             console.log("R added");
    //         }
    //         if(this.G < 228){
    //             this.G++;
    //             console.log("G added");
    //         }
    //         if(this.B < 242){
    //             this.B++;
    //         }
    //         this.context.strokeStyle =   'rgb('+ this.R +', '+ this.G +', '+ this.B +')';
    //         if(this.R == 255 && this.G == 228 && this.B == 242){
    //             console.log("reseting colors");
    //             this.R = 0;
    //             this.G = 7;
    //             this.B = 111;
    //         }  
    //     }
        
        switch(this.tool){
            case TOOL_LINE:
                this.drawShape(this.startPosition, this.currentPosition, this.savedData);
                this.send_data(this.tool, this.startPosition, this.line_Width, this.color, false, this.currentPosition, undefined, undefined);
                break;
            case TOOL_RECTANGLE:
                this.drawShape(this.startPosition, this.currentPosition, this.savedData);
                this.send_data(this.tool, this.startPosition, this.line_Width, this.color, false, this.currentPosition, undefined, undefined);
                break;
            case TOOL_CIRCLE:
                this.drawShape(this.startPosition, this.currentPosition, this.savedData);
                this.send_data(this.tool, this.startPosition, this.line_Width, this.color, false, this.currentPosition, undefined, undefined);
                break;
            case TOOL_TRIANGLE:
                this.drawShape(this.startPosition, this.currentPosition, this.savedData);
                this.send_data(this.tool, this.startPosition, this.line_Width, this.color, false, this.currentPosition, undefined, undefined);
                break;
            case TOOL_PENCIL:
                this.drawPencilLine(this.currentPosition);
                this.send_data(this.tool, this.currentPosition, this.line_Width, this.color);
                break;
            case TOOL_ERASER:
                this.context.clearRect(this.currentPosition.x, this.currentPosition.y, this.line_Width, this.line_Width);
                this.send_data(this.tool, this.currentPosition, this.line_Width);
                break;
            default :
                break;
            }
        }

    onMouseUp(mouse_event){
        this.whiteboard.onmousemove = null;
        document.onmouseup = null;
    }


    textInput(startPos){
        if(this.text_count_reference == 1){
            this.textStartPos = startPos;
            this.text_input.style.left = new String (startPos.x + "px");
            this.text_input.style.top = new String (startPos.y + "px");
            this.text_input.style.display= "block";
            this.text_count_reference -= 1;
        }else{
            this.send_data(this.tool, this.textStartPos, undefined,this.color, true, undefined, this.text_input.value);
            this.textDraw(this.textStartPos, this.text_input.value);
        }
    }
    
    textDraw(startPos, text){
        this.text = text;
        this.context.font = "20px Verdana";
        this.context.fillText(this.text, startPos.x , startPos.y  + 20);
        this.text_input.value = "";
        this.text_input.style.display= "none";
        this.text_count_reference += 1;
    }


    drawShape(startPos, currentPos, boardData){
        this.context.putImageData(boardData, 0, 0);
        this.context.beginPath();
        var x = startPos.x;
        var y = startPos.y;
        var cx = currentPos.x;
        var cy = currentPos.y;

        if (this.tool == TOOL_LINE){
            this.context.moveTo(x, y);
            this.context.lineTo(cx, cy);
        }
        else if (this.tool == TOOL_RECTANGLE){
            this.context.rect(x, y, cx - x, cy - y);
        }
        else if (this.tool == TOOL_CIRCLE){
            let radius = radiusCalculate(startPos, currentPos);
            this.context.arc(x, y, radius, 0, 2*Math.PI, false);
        }
        else if(this.tool == TOOL_TRIANGLE){
            this.context.moveTo(x + (cx - x) / 2, y);
            this.context.lineTo(x, cy);
            this.context.lineTo(cx, cy);
            this.context.closePath();
        }
        this.context.stroke();
    }

    drawPencilLine(Position){
        this.context.lineWidth = this.line_Width;
        this.context.lineTo(Position.x, Position.y);
        this.context.stroke();
    }

    //Undo and Redo Logic
    //when undo is clicked //store the currentData of the whiteboard
                           //put the undoData image and pop it from the undostack
                           //push the stored currentData of the whiteboard to the redostack
    //when redo is clicked //store the currentData of the whiteboard
                           //put the redoData image to the whiteboard and pop it from the undostack
                           //push the stored currentData to the undo stack

    undoCommand(type= "normal"){
        if(type == "normal"){
            if(this.undoStack.length >= 0){
                let currentData = this.context.getImageData(0, 0, this.whiteboard.clientWidth, this.whiteboard.clientHeight);
                let undoData = this.undoStack[this.undoStack.length - 1];
                this.context.putImageData(undoData, 0, 0);
                if(this.redoStack.length >= this.stackLimit) this.redoStack.shift();
                this.redoStack.push(currentData);
                this.undoStack.pop();
                }
            else{
                alert("no undo avilable");
            }
        }
        else if(type == "socket"){
            if(this.socketUndoStack.length >= 0){
                let currentData = this.context.getImageData(0, 0, this.whiteboard.clientWidth, this.whiteboard.clientHeight);
                let undoData = this.socketUndoStack[this.socketUndoStack.length - 1];
                this.context.putImageData(undoData, 0, 0);
                if(this.socketRedoStack.length >= this.stackLimit) this.socketRedoStack.shift();
                this.socketRedoStack.push(currentData);
                this.socketUndoStack.pop();
                }
            else{
                console.log("undo limit reached")
            }
        }
    }


    redoCommand(type= "normal"){
        if(type == "normal"){
            if(this.redoStack.length >= 0){
                let currentData = this.context.getImageData(0, 0, this.whiteboard.clientWidth, this.whiteboard.clientHeight);
                let redoData = this.redoStack[this.redoStack.length - 1];
                this.context.putImageData(redoData, 0, 0);
                if(this.undoStack.length >= this.stackLimit) this.undoStack.shift();
                this.undoStack.push(currentData);
                this.redoStack.pop();
            }else{
                alert("no redo avilable");
            }
        }
        else if(type == "socket"){
            if(this.socketRedoStack.length >= 0){
                let currentData = this.context.getImageData(0, 0, this.whiteboard.clientWidth, this.whiteboard.clientHeight);
                let redoData = this.socketRedoStack[this.socketRedoStack.length - 1];
                this.context.putImageData(redoData, 0, 0);
                if(this.socketUndoStack.length >= this.stackLimit) this.socketUndoStack.shift();
                this.socketUndoStack.push(currentData);
                this.socketRedoStack.pop();
            }else{
                alert("no redo avilable");
            }
        }
    }
    
    clearBoard(){
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        // Will always clear the right space
        this.context.clearRect(0, 0, this.whiteboard.width, this.whiteboard.height);
        this.context.restore();
        // Still have my old transforms
    }

    uploadImage(file){
        var reader = new FileReader();
        var self = this;
        reader.readAsDataURL(file);
        reader.onloadend = function(event) {
            var img = new Image();
            img.src = event.target.result;
            self.context.drawImage(img, 0, 0);
        }}

    uploadPdf(file){
        var reader = new FileReader();
        var self = this;
        reader.readAsDataURL(file);
        reader.onloadend = function(event) {
            var pdfjsLib = window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.2.2/pdf.worker.js';
            var loadingTask = pdfjsLib.getDocument({url:event.target.result})
            loadingTask.promise.then(function(pdf) {
                pdf.getPage(1).then(function(page) {
                    var scale = 0.75;
                    var viewport = page.getViewport({scale: scale});
                    var renderContext = {
                        canvasContext: self.context,
                        viewport: viewport
                    };
                    page.render(renderContext);
                    self.context.clearRect(0, 0, self.whiteboard.width, self.whiteboard.height);
                    self.context.beginPath();
                })})}   
            }
    
    
    // uploadPPT(file){
        // console.log("ppt function called");
        // var blank_pdf = new jsPDF();

        // console.log("Blank pdf created");
        // blank_pdf.text(20,20,"This is a Test");
        // this.uploadPdf(blank_pdf);
        
        // const sourceFilePath = file;
        // const outputFilePath = blank_pdf;

        // var unoconv = require('awesome-unoconv');
        // unoconv
        //   .convert(sourceFilePath, outputFilePath)
        //   .then(result => {
        //     console.log("Result=" + result); // return outputFilePath
        //   })
        //   .catch(err => {
        //     console.log("Error" + err);
        //   });

// }
    
            
    whiteboard_selection_btn_manage(whiteboard_no, total_no_whiteboard){
        if(whiteboard_no == total_no_whiteboard && total_no_whiteboard < this.whiteboardStackLimit){
            this.add_whiteboard_btn.style.display = "block";
            this.next_whiteboard_btn.style.display = "none";
        }else{
            this.add_whiteboard_btn.style.display = "none";
            this.next_whiteboard_btn.style.display = "block";
        }
    }
    
    addWhiteboard(){
        let currentState = this.context.getImageData(0, 0, this.whiteboard.clientWidth, this.whiteboard.clientHeight);
        if((this.previousWhiteboardStack.length + this.nextWhiteboardStack.length) <= this.whiteboardStackLimit){
            this.previousWhiteboardStack.push(currentState);
            console.log(this.previousWhiteboardStack);
            this.clearBoard();
            this.whiteboard_no += 1;
            this.total_no_whiteboard += 1;
            this.whiteboard_no_tag.innerHTML = this.whiteboard_no;
            this.whiteboard_selection_btn_manage(this.whiteboard_no, this.total_no_whiteboard);
        }else{
            alert("Whiteboard Limit reached")
        }
    }
    
    
    previousWhiteboard(){
        let currentState = this.context.getImageData(0, 0, this.whiteboard.clientWidth, this.whiteboard.clientHeight);
        if(this.previousWhiteboardStack.length > 0){
            this.clearBoard();
            let previous_whiteboard = this.previousWhiteboardStack[this.previousWhiteboardStack.length - 1];
            this.context.putImageData(previous_whiteboard, 0, 0);
            this.previousWhiteboardStack.pop();
            this.whiteboard_no -= 1;
            this.whiteboard_no_tag.innerHTML = this.whiteboard_no;
            this.nextWhiteboardStack.push(currentState);
            this.whiteboard_selection_btn_manage(this.whiteboard_no, this.total_no_whiteboard);
        }   
    };
    
    nextWhiteboard(){
        let currentState = this.context.getImageData(0, 0, this.whiteboard.clientWidth, this.whiteboard.clientWidth);
        if(this.nextWhiteboardStack.length > 0){
            this.clearBoard();
            let next_whiteboard = this.nextWhiteboardStack[this.nextWhiteboardStack.length - 1];
            this.previousWhiteboardStack.push(currentState);
            this.context.putImageData(next_whiteboard, 0, 0);
            this.nextWhiteboardStack.pop();
            this.whiteboard_no += 1;
            this.whiteboard_no_tag.innerHTML = this.whiteboard_no;
            this.whiteboard_selection_btn_manage(this.whiteboard_no, this.total_no_whiteboard);
        };
    }
}