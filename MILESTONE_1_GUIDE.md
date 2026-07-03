# 📚 Milestone 1: Implementation Guide

## Your Task
Complete the `handleDrop` function in `MainWorkspace.tsx` to extract PDF file paths and prepare them for IPC communication.

---

## 🎯 Step-by-Step Instructions

### Step 1: Understanding the Drag-and-Drop Event
When a user drops files onto your drop zone, the browser fires a `drop` event. This event contains a `dataTransfer` object with information about the dropped files.

### Step 2: Accessing File Information
The dropped files are accessible through:
```typescript
e.dataTransfer.files
```

This returns a `FileList` object (similar to an array) containing `File` objects.

### Step 3: Extracting File Paths in Electron
In a web browser, you can only access the file name and content, but in Electron, you can access the **full file path** using:
```typescript
file.path
```

---

## 📖 Generic Code Example

Here's a standalone example showing how to handle file drops and extract paths:

```typescript
const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
  e.preventDefault()
  e.stopPropagation()
  
  // Get the FileList from the drop event
  const files = e.dataTransfer.files
  
  // Convert FileList to Array for easier manipulation
  const fileArray = Array.from(files)
  
  // Extract file paths (Electron-specific - 'path' property exists on File in Electron)
  const filePaths = fileArray.map((file: File) => {
    // In Electron, File objects have a 'path' property
    return (file as any).path
  })
  
  // Filter to only include PDF files
  const pdfPaths = filePaths.filter((path: string) => 
    path.toLowerCase().endsWith('.pdf')
  )
  
  console.log('PDF paths:', pdfPaths)
  
  // Next step: Send these paths to the main process via IPC
  // (You'll implement this next)
}
```

---

## 🔧 What You Need to Implement

In `src/renderer/src/components/MainWorkspace.tsx`, find the `handleDrop` function and:

1. **Extract the files** from `e.dataTransfer.files`
2. **Convert** the `FileList` to an array
3. **Map** each file to get its `.path` property (Electron-specific)
4. **Filter** to only include files ending with `.pdf`
5. **Log** the result to verify it works
6. **Store** the paths (you can use React state for now)

### TypeScript Tip
Since TypeScript doesn't know about Electron's `.path` property on File objects, you'll need to type cast:
```typescript
(file as any).path
```

Or create a proper type:
```typescript
interface ElectronFile extends File {
  path: string
}
```

---

## ✅ Testing Your Implementation

1. Run your app with `npm run dev`
2. Open DevTools (F12)
3. Drag a PDF file onto the drop zone
4. Check the console - you should see the full file path(s) printed
5. Try dragging multiple PDFs at once

---

## 🚀 Success Criteria

Before moving to Milestone 2, you should:
- ✅ See file paths logged to the console when dropping PDFs
- ✅ Verify non-PDF files are filtered out
- ✅ Confirm multiple PDFs can be dropped simultaneously
- ✅ Understand how the `dataTransfer` API works

---

## 📝 Notes

- The `preventDefault()` and `stopPropagation()` calls are crucial - they prevent the browser from opening the PDF
- The visual feedback (drag state) is already handled by the `isDragging` state
- Don't worry about IPC communication yet - that's Milestone 2!

---

## 🤔 Stuck? Common Issues

**"I see the file name but not the full path"**
- Make sure you're accessing `file.path`, not `file.name`
- The `.path` property is Electron-specific and won't work in a regular browser

**"Nothing appears in the console"**
- Check that your `onDrop` handler is properly connected to the div
- Ensure you're not missing the `e.preventDefault()` calls

**"TypeScript errors on `.path`"**
- Use type casting: `(file as any).path`

---

Once you've completed this, paste your working `handleDrop` function here for review, and I'll give you Milestone 2! 🎉
