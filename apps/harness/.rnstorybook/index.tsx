import AsyncStorage from '@react-native-async-storage/async-storage';
import { view } from './storybook.requires';

// AsyncStorage must be passed explicitly or on-device Storybook throws on story state.
const StorybookUI = view.getStorybookUI({
  storage: AsyncStorage,
  // Open on a real component rather than whatever was last viewed on this simulator.
  initialSelection: { kind: 'AI Elements/Chat Surfaces', name: 'Open In Board' },
});

export default StorybookUI;
