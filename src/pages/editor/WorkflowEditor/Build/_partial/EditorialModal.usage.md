# Editorial Modal - Usage Guide

## Component Location
`src/pages/editor/WorkflowEditor/Build/_partial/EditorialModal.partial.tsx`

## Basic Usage

```tsx
import { useState } from 'react';
import { EditorialModal } from './_partial/EditorialModal.partial';

const YourComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Open Modal
      </button>

      <EditorialModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Property Analysis"
        accentColor="bg-emerald-500" // Optional: indigo-500, rose-500, amber-500
      >
        <div className="space-y-4">
          <p className="font-serif italic text-lg">
            Input your logic here...
          </p>
          <textarea 
            className="w-full border-2 border-editorial-ink rounded-none p-4 font-mono text-sm bg-editorial-bg" 
            rows={4}
          />
        </div>
      </EditorialModal>
    </>
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Controls modal visibility |
| `onClose` | `() => void` | required | Callback when modal closes |
| `title` | `string` | required | Modal header title (displayed in serif italic) |
| `children` | `React.ReactNode` | required | Modal content |
| `accentColor` | `string` | `'bg-editorial-ink'` | Header strip background color |

## Accent Color Options

Match the accent color to your node types:

- **AI Nodes**: `accentColor="bg-indigo-500"`
- **Logic/Web Nodes**: `accentColor="bg-emerald-500"`
- **Action Nodes**: `accentColor="bg-rose-500"`
- **Filter Nodes**: `accentColor="bg-amber-500"`
- **Default/Neutral**: `accentColor="bg-editorial-ink"` (or omit)

## Examples

### 1. Node Configuration Modal

```tsx
<EditorialModal 
  isOpen={isConfigOpen} 
  onClose={() => setIsConfigOpen(false)}
  title="Node Configuration"
  accentColor="bg-indigo-500"
>
  <div className="space-y-6">
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-editorial-ink/70 mb-2">
        Prompt Template
      </label>
      <textarea 
        className="w-full border-2 border-editorial-ink rounded-none p-3 font-mono text-sm bg-editorial-bg"
        rows={6}
        placeholder="Enter your prompt..."
      />
    </div>
    
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-editorial-ink/70 mb-2">
        Temperature
      </label>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.1"
        className="w-full"
      />
    </div>
  </div>
</EditorialModal>
```

### 2. Delete Confirmation Modal

```tsx
<EditorialModal 
  isOpen={isDeleteOpen} 
  onClose={() => setIsDeleteOpen(false)}
  title="Confirm Deletion"
  accentColor="bg-rose-500"
>
  <div className="space-y-4">
    <p className="font-serif italic text-lg text-editorial-ink">
      Are you sure you want to delete this workflow?
    </p>
    <p className="font-mono text-[10px] tracking-tighter text-editorial-ink/60">
      This action cannot be undone. All nodes and connections will be permanently removed.
    </p>
  </div>
</EditorialModal>
```

### 3. Share/Export Modal

```tsx
<EditorialModal 
  isOpen={isShareOpen} 
  onClose={() => setIsShareOpen(false)}
  title="Share Workflow"
  accentColor="bg-emerald-500"
>
  <div className="space-y-4">
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-editorial-ink/70 mb-2">
        Share Link
      </label>
      <div className="flex gap-2">
        <input 
          type="text" 
          value="https://agent1o1.ai/wf/abc123"
          readOnly
          className="flex-1 border-2 border-editorial-ink rounded-none p-3 font-mono text-xs bg-editorial-bg"
        />
        <button className="rounded-none border-2 border-editorial-ink bg-editorial-ink px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">
          Copy
        </button>
      </div>
    </div>
  </div>
</EditorialModal>
```

## Design Features

### What Makes This "Editorial"?

1. **Hard Shadows**: `shadow-[12px_12px_0px_rgba(26,26,26,0.15)]` creates a physical cardstock feel
2. **No Border Radius**: `rounded-none` everywhere for that architectural blueprint aesthetic
3. **Typography Contrast**: 
   - Header: `font-serif font-black italic` (elegant)
   - Labels: `font-black uppercase tracking-widest text-[10px]` (technical)
   - Body: `font-mono tracking-tighter` (metadata)
4. **Spring Animation**: Smooth entrance with `type: 'spring', damping: 25, stiffness: 350`
5. **Brutalist Buttons**: Square corners, hard shadows, active state pushes button down
6. **Deliberate Borders**: 2px ink borders create structural honesty

## Customization

### Override Footer Actions

The default footer has Cancel/Save buttons. To customize:

```tsx
<EditorialModal 
  isOpen={isOpen} 
  onClose={onClose}
  title="Custom Actions"
>
  <div className="space-y-4">
    {/* Your content */}
  </div>
  
  {/* The footer is part of the component, but you can modify the source 
      to accept custom action buttons as props if needed */}
</EditorialModal>
```

### Modify the Component

If you need custom footer actions, edit `EditorialModal.partial.tsx` lines 58-66 to accept a `footerActions` prop or render children in the footer.
