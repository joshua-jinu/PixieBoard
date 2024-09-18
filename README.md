# PixieBoard - Collaborative Whiteboard

PixieBoard is an interactive, real-time whiteboard built with HTML5 Canvas, Node.js, WebSockets, and Express.js. It allows users to draw collaboratively, upload images and PDFs, and provides various tools for drawing shapes, selecting colors, and more. This project is perfect for classrooms, brainstorming sessions, and collaborative design work.

## Features

### 1. **Real-Time Collaboration**
   - Leverages WebSockets to allow multiple users to draw on the whiteboard simultaneously. Any drawing action performed by one user is reflected in real-time for all connected users.

### 2. **Drawing Tools**
   - **Pencil Tool**: A simple freehand drawing tool to allow users to draw lines and curves.
   - **Eraser Tool**: Allows erasing part of the drawings from the canvas.
   - **Shape Tools**: Draw basic geometric shapes like circles, rectangles, triangles, and straight lines.
   - **Text Tool**: Users can add text to the canvas.

### 3. **Undo/Redo**
   - Allows users to revert to previous actions or redo actions they’ve undone.

### 4. **Line Size Selection**
   - Choose different thicknesses for drawing lines or shapes with preset sizes (1px, 2px, 4px, 6px, 8px, 10px).

### 5. **Color Picker**
   - A variety of colors are available to choose from (Black, Red, Blue, Orange, Violet, Green, Pink, Neon Green, Yellow, Bright Pink).
   - The selected color applies to the pencil, shapes, and text.

### 6. **File Upload (Images and PDFs)**
   - **Image Upload**: Upload image files (JPEG, PNG, etc.) and place them directly on the whiteboard.
   - **PDF Upload**: Upload PDF files, allowing users to annotate PDFs by drawing over them.

### 7. **Whiteboard Management**
   - Users can navigate between multiple whiteboards using the next and previous buttons.
   - New whiteboards can be added on the fly to extend the workspace.

### 8. **Canvas Export**
   - Export the current state of the whiteboard as an image (PNG/JPEG) or PDF for download.

### 9. **Clear Whiteboard**
   - Clear all contents of the whiteboard to start fresh.

### 10. **Page Navigation for PDFs**
   - If a PDF is uploaded, users can navigate through the PDF pages using the next/previous page buttons.

### 11. **Responsive Design**
   - The whiteboard adjusts to fit the browser window size, ensuring a smooth experience on different screen sizes.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/pixieboard.git
    cd pixieboard
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the server:

    ```bash
    npm start
    ```

4. Open the application in your browser at `http://localhost:8000`.

## Usage

- **Drawing**: Select the pencil tool and draw on the canvas.
- **Erasing**: Use the eraser tool to remove drawings.
- **Shapes**: Choose from the shape tools (circle, rectangle, triangle, line) and draw on the canvas.
- **Text**: Use the text tool to add text.
- **Undo/Redo**: Click the undo or redo buttons to revert or restore actions.
- **File Upload**: Upload images or PDFs, then annotate or navigate through PDF pages.
- **Whiteboard Management**: Add new whiteboards and switch between them.
- **Export**: Save your whiteboard as an image or PDF.

## Technologies Used

- **HTML5 Canvas**: For drawing and rendering shapes.
- **Node.js**: Backend server.
- **Express.js**: Web server framework.
- **Socket.io**: Real-time collaboration.
- **JavaScript**: Frontend logic.

## Future Enhancements

- User authentication for private whiteboards.
- Save and reload whiteboard sessions.
- Real-time chat for better collaboration.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
