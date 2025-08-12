import { describe, it, expect } from 'vitest';
import { useEditorStore } from '../stores/editorStore';
import { useFileStore } from '../stores/fileStore';
import { useSettingsStore } from '../stores/settingsStore';

describe('Stores', () => {
  it('should import editorStore without errors', () => {
    expect(useEditorStore).toBeDefined();
  });

  it('should import fileStore without errors', () => {
    expect(useFileStore).toBeDefined();
  });

  it('should import settingsStore without errors', () => {
    expect(useSettingsStore).toBeDefined();
  });
});