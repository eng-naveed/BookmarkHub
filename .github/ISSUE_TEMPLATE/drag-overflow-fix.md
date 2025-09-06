---
name: Drag and Drop Overflow Issue
about: Fix card overflow to the right when dragging and re-arranging bookmarks
title: "[BUG] Drag and Drop Overflow - Cards overflow to the right during re-arrangement"
labels: ["bug", "drag-and-drop", "ui/ux", "good first issue"]
assignees: ""
---

## 🐛 **Bug Description**

When dragging and re-arranging bookmark cards, the cards overflow to the right side of the container, causing layout issues and poor user experience.

## 🔄 **Steps to Reproduce**

1. **Add multiple bookmarks** (at least 4-5 bookmarks)
2. **Navigate to the main bookmark view** (grid or list view)
3. **Try to drag and re-arrange** any bookmark card
4. **Observe the overflow** - cards will extend beyond the right boundary
5. **Continue dragging** to see the full extent of the overflow issue

## 🎯 **Expected Behavior**

- **No overflow**: Cards should stay within the container boundaries
- **Smooth dragging**: Cards should move smoothly without layout breaks
- **Proper constraints**: Drag area should be limited to the visible container
- **Visual feedback**: Clear indication of valid drop zones

## 🚫 **Current Behavior**

- **Right overflow**: Cards extend beyond the right edge of the container
- **Layout breaking**: Container boundaries are not respected
- **Poor UX**: Dragging feels broken and unprofessional
- **Visual glitches**: Cards appear to "escape" the intended area

## 🔧 **Technical Analysis**

### **Root Cause:**

The drag and drop implementation likely doesn't have proper boundary constraints or the container doesn't have `overflow: hidden` applied correctly.

### **Files to investigate:**

- `components/bookmarks/bookmark-views.tsx` - Main drag and drop logic
- `components/bookmarks/bookmark-card.tsx` - Individual card dragging
- CSS classes for container constraints
- Drag and drop library configuration (if using a library)

### **Potential solutions:**

1. **Container constraints**: Add `overflow: hidden` to the container
2. **Drag boundaries**: Implement drag boundary detection
3. **CSS fixes**: Ensure proper width constraints
4. **Library configuration**: Update drag and drop library settings

## 📋 **Acceptance Criteria**

- [ ] **No right overflow**: Cards stay within container boundaries during drag
- [ ] **Smooth dragging**: No layout jumps or visual glitches
- [ ] **Proper constraints**: Drag area limited to visible container
- [ ] **Visual feedback**: Clear drop zone indicators
- [ ] **Responsive**: Works on all screen sizes
- [ ] **Performance**: No lag or stuttering during drag operations
- [ ] **Accessibility**: Maintains keyboard navigation support

## 🧪 **Testing Scenarios**

### **Test Cases:**

1. **Basic drag**: Drag a single card to different positions
2. **Multiple cards**: Drag multiple cards in sequence
3. **Edge cases**: Drag to the very edges of the container
4. **Different views**: Test in grid, list, and masonry views
5. **Responsive**: Test on mobile, tablet, and desktop
6. **Performance**: Test with many bookmarks (10+)

### **Viewport Testing:**

- **Mobile**: 375px width
- **Tablet**: 768px width
- **Desktop**: 1200px+ width
- **Large screens**: 1920px+ width

## 🔍 **Debugging Steps**

1. **Inspect the container** CSS properties
2. **Check drag and drop library** configuration
3. **Test with browser dev tools** to see overflow
4. **Add temporary borders** to visualize container boundaries
5. **Check for conflicting CSS** that might affect layout

## 🛠️ **Implementation Notes**

### **CSS Properties to check:**

```css
.container {
  overflow: hidden; /* Prevent overflow */
  width: 100%; /* Ensure full width */
  max-width: 100%; /* Prevent exceeding container */
}
```

### **Drag and Drop considerations:**

- **Boundary detection**: Implement proper drag boundaries
- **Container awareness**: Make drag system aware of container limits
- **Visual feedback**: Show valid drop zones clearly

## 📱 **Screenshots/Video**

**Before (Current Issue):**

- Cards overflow to the right during drag
- Layout breaks and looks unprofessional

**After (Expected Fix):**

- Cards stay within boundaries
- Smooth, professional drag experience

## 🚀 **Getting Started**

1. **Fork the repository**
2. **Create a new branch**: `git checkout -b fix/drag-overflow-issue`
3. **Install dependencies**: `yarn install`
4. **Start dev server**: `yarn dev`
5. **Add test bookmarks** to reproduce the issue
6. **Investigate the drag and drop implementation**
7. **Implement the fix** with proper constraints
8. **Test thoroughly** on different screen sizes

## 📚 **Helpful Resources**

- [CSS Overflow Property](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow)
- [Drag and Drop Best Practices](https://web.dev/drag-and-drop/)
- [CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)

## 🏷️ **Labels**

- `bug` - Bug fix
- `drag-and-drop` - Drag and drop functionality
- `ui/ux` - User interface/experience
- `good first issue` - Suitable for new contributors

---

**Difficulty**: 🟡 Intermediate  
**Estimated Time**: 3-5 hours  
**Skills Needed**: React, TypeScript, CSS, Drag and Drop, Debugging
