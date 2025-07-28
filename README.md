# SketchFlow Studio - AI-Powered Drawing Canvas

A modern, AI-driven drawing application built with Next.js, featuring real-time canvas interactions, advanced drawing capabilities, and intelligent collaboration tools.

## ✨ Features

### 🎨 **Core Drawing Tools**
- **Advanced Drawing Tools**: Pencil, Rectangle, Circle, Diamond, Arrow, Line, Text, Eraser
- **Smart Selection**: Precise object selection and manipulation
- **Layer Management**: Organize your work with multiple layers
- **Undo/Redo System**: Complete history management with keyboard shortcuts

### 🤖 **AI-Powered Features**
- **Smart Suggestions**: Get intelligent recommendations for your drawings
- **Auto Complete**: AI helps complete your shapes and lines
- **Style Transfer**: Apply different artistic styles to your drawings
- **Object Detection**: Automatically detect and label objects
- **Smart Layout**: AI suggests optimal positioning for elements
- **Mathematical Expression Recognition**: Convert handwritten math to LaTeX

### 👥 **Real-time Collaboration**
- **Live Collaboration**: Work together with multiple users in real-time
- **User Presence**: See who's online and their activity status
- **In-app Chat**: Communicate with collaborators directly
- **Shared Cursors**: See where others are working
- **Link Sharing**: Easy project sharing with unique URLs

### 🛠️ **Professional Tools**
- **Export/Import**: Save as PNG, import images
- **Zoom Controls**: Precise zoom from 10% to 300%
- **Keyboard Shortcuts**: Professional workflow with shortcuts
- **Auto-save**: Never lose your work with automatic saving
- **Project Management**: Organize projects with custom names
- **Responsive Design**: Works perfectly on desktop and mobile

### 🎯 **Advanced Features**
- **Color Palettes**: Extensive color selection with custom palettes
- **Stroke Width Control**: Precise line thickness adjustment
- **Background Options**: Transparent and colored backgrounds
- **Template Library**: Quick-start templates for common use cases
- **Performance Optimized**: Smooth 60fps drawing experience

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ⌨️ Keyboard Shortcuts

- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z**: Redo
- **Ctrl+S**: Export/Save
- **Ctrl+O**: Import
- **Ctrl+=**: Zoom In
- **Ctrl+-**: Zoom Out
- **Ctrl+0**: Reset Zoom

## 🏗️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React, Tabler Icons
- **Animations**: Framer Motion
- **AI Integration**: Google Generative AI
- **Real-time**: WebSocket support
- **Storage**: Local Storage + Cloud sync

## 📁 Project Structure

```
src/
├── app/           # Next.js app directory
│   ├── canvas/    # Canvas pages with room-based routing
│   └── ...
├── components/    # React components
│   ├── canvaspage.tsx      # Main drawing canvas
│   ├── CollaborationPanel.tsx  # Real-time collaboration
│   ├── AIFeatures.tsx      # AI-powered features
│   └── ...
├── lib/          # Utility functions
└── ...
```

## 🎨 Use Cases

- **Flowcharts & Diagrams**: Perfect for process mapping
- **Mathematical Work**: LaTeX rendering for equations
- **Wireframing**: Design layouts and interfaces
- **Mind Mapping**: Organize ideas and concepts
- **Educational Content**: Interactive learning materials
- **Team Collaboration**: Real-time brainstorming sessions

## 🚀 Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Advanced Configuration

### Environment Variables
No environment variables required! The project works out of the box.

### Customization
- Modify color palettes in `src/components/canvaspage.tsx`
- Add new AI features in `src/components/AIFeatures.tsx`
- Extend collaboration features in `src/components/CollaborationPanel.tsx`

## 🤝 Contributing

This project is designed for personal and educational use. Feel free to fork and customize for your needs.

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

**Shreedhar Anand**
- GitHub: [@shreedhardynamiccraft](https://github.com/shreedhardynamiccraft)
- LinkedIn: [Shreedhar Anand](https://www.linkedin.com/in/shreedhar-anand-23a699214/)
- Twitter: [@shreedhar_garg](https://x.com/shreedhar_garg)

---

**Built with ❤️ using Next.js, TypeScript, and AI**
# sketchflow-studio
