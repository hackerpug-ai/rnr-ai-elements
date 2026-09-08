// Browser stand-ins for the registry's native-only Expo peers. Stories exercise the
// visual surface; picking is native-only (resolve canceled), clipboard is real.
// TS still type-checks against the REAL packages — this alias is bundle-time only.
export const Clipboard = {
  setStringAsync: async (text: string) => {
    await navigator.clipboard.writeText(text);
    return true;
  },
  getStringAsync: async () => ({ text: await navigator.clipboard.readText() }),
};

export const ImagePicker = {
  launchImageLibraryAsync: async () => ({ canceled: true, assets: [] }),
};

export const DocumentPicker = {
  getDocumentAsync: async () => ({ canceled: true, assets: [] }),
};
