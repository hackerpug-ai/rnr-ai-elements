import { Button } from '@/registry/{engine}/components/ui/button';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import {
  InputGroup,
  InputGroupActions,
  InputGroupInput,
} from '@/registry/{engine}/components/ui/input-group';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/registry/{engine}/components/ui/item';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/registry/{engine}/components/ui/sheet';
import { Text, TextClassContext } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowUpIcon,
  CheckIcon,
  FileIcon,
  PaperclipIcon,
  PlusIcon,
  SquareIcon,
  XIcon,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Image, ScrollView, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  type PickerKind,
  type PromptInputAttachmentData,
  type PromptInputError,
  type PromptInputMessage,
  imageAssetToAttachment,
  makeAttachmentId,
  resolvePickerKind,
  stripIds,
  validateAttachments,
} from './prompt-input.logic';
import { getMediaCategory } from './attachments.logic';

/**
 * PromptInput — the composer, at web parity for composition (behavior spec:
 * design/refine/prompt-input-web-behavior-spec.md; visuals: prompt-input-design-spec.md).
 *
 * THE SUBMIT CONTRACT IS DELIBERATELY DIFFERENT. The web version is Enter-submits,
 * Shift+Enter-newline, with an IME-composition guard. On a soft keyboard none of that
 * exists: Enter is a newline and there is no modifier. So an explicit SEND BUTTON is
 * the ONLY submit path, and the ready-state icon is ArrowUp (the mobile idiom) where
 * the web renders CornerDownLeft (a keyboard glyph that means nothing under a thumb).
 * That is a real behavioural change, made once, on purpose.
 *
 * WHAT IS PRESERVED, because it is the rule that protects the user:
 *   a resolved onSubmit clears the text AND the attachments; an onSubmit that THROWS
 *   OR REJECTS leaves both exactly where they were. Losing someone's typed message on
 *   a network failure is the failure this exists to prevent.
 *
 * Composition (web parity — the consumer composes the field):
 *   <PromptInput onSubmit status onStop accept …>
 *     <PromptInputHeader><PromptInputAttachments /></PromptInputHeader>   ← first row
 *     <PromptInputBody>
 *       <PromptInputTextarea />
 *       <PromptInputFooter>
 *         <PromptInputTools>
 *           <PromptInputToolsMenuTrigger />          ← the + (menu content lives below)
 *           <ModelSelectorTrigger … />               ← the model chip (consumer composes)
 *         </PromptInputTools>
 *         <PromptInputPrimary renderVoice={…} />     ← never-dead slot (morph table)
 *       </PromptInputFooter>
 *     </PromptInputBody>
 *     <PromptInputToolsMenu open onOpenChange>       ← portals; render it anywhere
 *       <PromptInputToolsMenuItem icon={CameraIcon} label="Camera" … />
 *     </PromptInputToolsMenu>
 *   </PromptInput>
 * The Header moved from the old dock slot to the field's first row (the web keeps its
 * header INSIDE the InputGroup, order-first) — that is what puts the chip row above
 * the textarea and inside the border, per the design spec §3.
 *
 * Dual-mode: wrap in <PromptInputProvider> to lift text + attachments into context
 * (usePromptInputController from anywhere under it); render bare for self-managed
 * state. Validation and the picker launcher live in the component either way, so the
 * provider's raw add is never reachable unvalidated.
 *
 * NOT PORTED, on the record (brief §non-goals): the ActionMenu dropdown parts (the
 * tools menu composes the house Sheet directly — PromptInputToolsMenu), AddScreenshot
 * (getDisplayMedia has no RN equivalent), HoverCard/Command/Tabs (@-palette is
 * hover/keyboard-shaped; out of PRD scope), the referenced-sources context, and the
 * PromptInputSelect parts (model switching composes the existing model-selector
 * organism — no duplicate select parts).
 *
 * Dependency note: expo-image-picker + expo-document-picker are opt-in install-time
 * dependencies recorded on the registry item (webview precedent); the ambient type
 * boundary in the registry package keeps typecheck green without them installed.
 */

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

export type {
  PickerKind,
  PromptInputAttachmentData,
  PromptInputError,
  PromptInputMessage,
} from './prompt-input.logic';

/* ------------------------------------------------------------------ context -- */

type PromptInputTextInput = {
  value: string;
  setInput: (v: string) => void;
  clear: () => void;
};

/** The provider's RAW attachments — no validation. PromptInput wraps it; nothing else reaches it. */
type PromptInputAttachmentsState = {
  files: PromptInputAttachmentData[];
  add: (files: PromptInputAttachmentData[]) => void;
  remove: (id: string) => void;
  clear: () => void;
};

type PromptInputController = {
  textInput: PromptInputTextInput;
  attachments: PromptInputAttachmentsState;
  /** PromptInput registers its picker launcher; an external trigger can then open it. */
  __registerPicker: (open: ((kind?: PickerKind) => void) | null) => void;
  __openPicker: (kind?: PickerKind) => void;
};

const ControllerContext = React.createContext<PromptInputController | null>(null);

/**
 * Lifts text + attachments into plain useState context — the web original's shape,
 * no store. Dual-mode PromptInput detects this context; nothing else has to.
 */
function PromptInputProvider({
  initialInput = '',
  children,
}: {
  initialInput?: string;
  children: React.ReactNode;
}) {
  const [text, setText] = React.useState(initialInput);
  const [files, setFiles] = React.useState<PromptInputAttachmentData[]>([]);
  const pickerRef = React.useRef<((kind?: PickerKind) => void) | null>(null);

  const value = React.useMemo<PromptInputController>(
    () => ({
      textInput: { value: text, setInput: setText, clear: () => setText('') },
      attachments: {
        files,
        add: (incoming) => setFiles((prev) => [...prev, ...incoming]),
        remove: (id) => setFiles((prev) => prev.filter((f) => f.id !== id)),
        clear: () => setFiles([]),
      },
      __registerPicker: (open) => {
        pickerRef.current = open;
      },
      __openPicker: (kind) => {
        pickerRef.current?.(kind);
      },
    }),
    [text, files],
  );

  return <ControllerContext.Provider value={value}>{children}</ControllerContext.Provider>;
}

/** Actionable, or the lift silently does nothing and the consumer debugs by staring. */
function usePromptInputController(): PromptInputController {
  const ctx = React.useContext(ControllerContext);
  if (!ctx) {
    throw new Error(
      'usePromptInputController must be used inside <PromptInputProvider>. Wrap the component that needs the lifted state: <PromptInputProvider>…</PromptInputProvider>.',
    );
  }
  return ctx;
}

/** What PromptInput provides to its subtree — the raw state plus its own machinery. */
type PromptInputAttachmentsValue = PromptInputAttachmentsState & {
  /** Validated add (accept / maxFileSize / maxFiles) in BOTH modes — raw adds escape here. */
  add: (files: PromptInputAttachmentData[]) => void;
  /** Opens a native picker; routes kind 'media' | 'file' from `accept` when omitted. */
  openPicker: (kind?: PickerKind) => void;
};

const AttachmentsContext = React.createContext<PromptInputAttachmentsValue | null>(null);

function usePromptInputAttachments(): PromptInputAttachmentsValue {
  const ctx = React.useContext(AttachmentsContext);
  if (!ctx) {
    throw new Error(
      'usePromptInputAttachments must be used inside <PromptInput>. Attachment parts read the composer\'s state; wrap them in <PromptInput>…</PromptInput>.',
    );
  }
  return ctx;
}

/** The field's text + submit machinery, local or provider-backed — Submit and Textarea read it. */
type PromptInputFieldValue = {
  text: string;
  setText: (v: string) => void;
  submit: () => void;
  busy: boolean;
  status: ChatStatus;
  onStop?: () => void;
  placeholder: string;
  maxHeight: number;
};

const FieldContext = React.createContext<PromptInputFieldValue | null>(null);

function usePromptInputField(): PromptInputFieldValue {
  const ctx = React.useContext(FieldContext);
  if (!ctx) {
    throw new Error(
      'PromptInput sub-components must be used inside <PromptInput>. Wrap them in <PromptInput>…</PromptInput>.',
    );
  }
  return ctx;
}

/* --------------------------------------------------------------------- root -- */

type PromptInputProps = Omit<ViewProps, 'children'> & {
  onSubmit: (message: PromptInputMessage) => void | Promise<void>;
  onStop?: () => void;
  status?: ChatStatus;
  placeholder?: string;
  /** Grow to this many px, then scroll internally. */
  maxHeight?: number;
  /** Comma MIME list with image/* wildcards — routes the picker and filters the picks. */
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  /** Bytes. */
  maxFileSize?: number;
  onError?: (error: PromptInputError) => void;
  children?: React.ReactNode;
};

function PromptInput({
  onSubmit,
  onStop,
  status = 'ready',
  placeholder = 'What would you like to know?',
  maxHeight = 140,
  accept,
  multiple = true,
  maxFiles,
  maxFileSize,
  onError,
  className,
  children,
  ...props
}: PromptInputProps) {
  const controller = React.useContext(ControllerContext);
  const insets = useSafeAreaInsets();

  // Dual-mode: text and attachments live in the provider when there is one, in local
  // state when there is not. Everything below is written against the resolved view.
  const [localText, setLocalText] = React.useState('');
  const text = controller ? controller.textInput.value : localText;
  const setText = controller ? controller.textInput.setInput : setLocalText;

  const [localFiles, setLocalFiles] = React.useState<PromptInputAttachmentData[]>([]);
  const files = controller ? controller.attachments.files : localFiles;
  const rawAdd = controller
    ? controller.attachments.add
    : (incoming: PromptInputAttachmentData[]) => setLocalFiles((prev) => [...prev, ...incoming]);
  const remove = controller
    ? controller.attachments.remove
    : (id: string) => setLocalFiles((prev) => prev.filter((f) => f.id !== id));
  const clear = controller
    ? controller.attachments.clear
    : () => setLocalFiles([]);

  const [busy, setBusy] = React.useState(false);

  // The ONE validated add, both modes — validation wraps whatever owns the state.
  const add = React.useCallback(
    (candidates: PromptInputAttachmentData[]) => {
      const { accepted, errors } = validateAttachments(candidates, {
        accept,
        maxFileSize,
        maxFiles,
        currentCount: files.length,
      });
      for (const error of errors) onError?.(error);
      if (accepted.length > 0) rawAdd(accepted);
    },
    [accept, maxFileSize, maxFiles, onError, rawAdd, files.length],
  );

  const openPicker = React.useCallback(
    async (kind?: PickerKind) => {
      // Explicit kinds (the + menu's rows) route by NAME; only the omitted kind is
      // derived from `accept` — resolvePickerKind never returns 'camera', so an
      // untargeted open can never land in the camera roll.
      const route = kind ?? resolvePickerKind(accept);
      let candidates: PromptInputAttachmentData[] = [];
      if (route === 'media' || route === 'camera') {
        if (route === 'camera') {
          // PERMISSION IS NOT CAPABILITY: a denied camera is a CANCELED pick —
          // nothing reaches the validated add(), so denial can never surface as a
          // fake success. Same early return as result.canceled below.
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) return;
        }
        // The camera is single-shot by nature (no allowsMultipleSelection); both
        // paths map through prompt-input.logic's ONE asset mapper, so a shot is
        // byte-identical to a library pick and rides the SAME validated add().
        const result =
          route === 'camera'
            ? await ImagePicker.launchCameraAsync({
                mediaTypes: ['images', 'videos'],
                quality: 1,
              })
            : await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos'],
                allowsMultipleSelection: multiple,
                selectionLimit: multiple ? undefined : 1,
                quality: 1,
              });
        if (result.canceled) return;
        candidates = result.assets.map(imageAssetToAttachment);
      } else {
        const result = await DocumentPicker.getDocumentAsync({ multiple });
        if (result.canceled) return;
        candidates = result.assets.map((asset) => ({
          id: makeAttachmentId(),
          mediaType: asset.mimeType ?? '',
          filename: asset.name,
          url: asset.uri,
          size: asset.size ?? undefined,
        }));
      }
      add(candidates);
    },
    [accept, multiple, add],
  );

  // Provider-lifted triggers (web's __registerFileInput seam): an external consumer
  // calls controller.__openPicker and lands HERE, validated like any other entry.
  React.useEffect(() => {
    if (!controller) return;
    controller.__registerPicker(openPicker);
    return () => controller.__registerPicker(null);
  }, [controller, openPicker]);

  const streaming = status === 'submitted' || status === 'streaming';

  const submit = React.useCallback(() => {
    if (busy || streaming) return;
    const value = text.trim();
    if (!value) return;
    setBusy(true);
    Promise.resolve()
      .then(() => onSubmit({ text: value, files: stripIds(files) }))
      .then(() => {
        // Only on success. A rejection leaves the text AND the attachments exactly
        // where they were — the retry-friendly contract, byte-verbatim from the
        // wave-3 component this refactor replaces.
        setText('');
        clear();
      })
      .catch(() => {
        // Intentionally swallowed here: the caller owns error reporting, and the
        // user's message must survive. Re-clearing or re-throwing would lose it.
      })
      .finally(() => setBusy(false));
  }, [busy, streaming, text, files, onSubmit, setText, clear]);

  const fieldValue = React.useMemo<PromptInputFieldValue>(
    () => ({ text, setText, submit, busy, status, onStop, placeholder, maxHeight }),
    [text, setText, submit, busy, status, onStop, placeholder, maxHeight],
  );

  const attachmentsValue = React.useMemo<PromptInputAttachmentsValue>(
    () => ({ files, add, remove, clear, openPicker }),
    [files, add, remove, clear, openPicker],
  );

  return (
    <View
      className={cn('gap-2 bg-background px-4 pt-2', className)}
      // The home indicator and the Android gesture bar both sit here.
      style={{ paddingBottom: insets.bottom || 8 }}
      {...props}
    >
      <FieldContext.Provider value={fieldValue}>
        <AttachmentsContext.Provider value={attachmentsValue}>
          <InputGroup className="flex-col items-stretch gap-2 rounded-xl px-2 py-2">
            {children}
          </InputGroup>
        </AttachmentsContext.Provider>
      </FieldContext.Provider>
    </View>
  );
}

/* -------------------------------------------------------------------- parts -- */

/** First row inside the field — attachment chips, a model trigger, queued messages. */
function PromptInputHeader({ className, ...props }: ViewProps) {
  return <View className={cn('flex-row items-center gap-2', className)} {...props} />;
}

/** Layout passthrough (the web's display:contents, as a View — RN has no contents). */
function PromptInputBody({ className, ...props }: ViewProps) {
  return <View className={cn('flex-col gap-2', className)} {...props} />;
}

/**
 * Provider-controlled or self-managed — it cannot tell and does not care: the value
 * arrives resolved through field context. Auto-grow to a cap, then scroll internally —
 * the RN equivalent of the web original's field-sizing CSS.
 */
function PromptInputTextarea({
  className,
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  const field = usePromptInputField();
  const [height, setHeight] = React.useState(0);
  // The original reset the measured height on submit; the extracted part achieves the
  // same instant re-collapse by watching for the cleared value.
  React.useEffect(() => {
    if (field.text === '') setHeight(0);
  }, [field.text]);
  return (
    <InputGroupInput
      multiline
      placeholder={field.placeholder}
      value={field.text}
      onChangeText={field.setText}
      onContentSizeChange={(e) => setHeight(e.nativeEvent.contentSize.height)}
      style={{ height: Math.min(Math.max(40, height), field.maxHeight) }}
      // flex-none is load-bearing: the base atom ships flex-1 (its ROW shell needs
      // grow/basis-0), but in this column flex-basis-0 makes Yoga size the field to
      // its CONTENT height (one 16px empty line), which both ignores the inline
      // height below and CLIPS the placeholder to that sliver — invisible on device
      // (measured: host 320x16 with the style-height right there in the fiber).
      // Height here is style-driven per the design spec; flex-1's grow/shrink must
      // not fight it.
      className="max-h-40 px-2 py-2 flex-none"
      accessibilityLabel="Message"
      {...props}
    />
  );
}

/**
 * Addon row. `justify-between` is not a class here — the submit carries ml-auto, which
 * pins it right when a cluster is present and costs nothing when it is not.
 */
function PromptInputFooter({ className, ...props }: ViewProps) {
  return <View className={cn('flex-row items-center', className)} {...props} />;
}

/** Left cluster — a plain container, no state, no default children. */
function PromptInputTools({ className, ...props }: ViewProps) {
  return <InputGroupActions className={cn('gap-1', className)} {...props} />;
}

/**
 * Ghost icon button, 44pt. `active` is the RN adaptation of the web's variant swap
 * (globe toggled on): bg-accent + foreground icon + selected. NO built-in toggle
 * state — the consumer owns it, exactly as the web's docs example does.
 * Icon color rides TextClassContext (muted at rest, foreground when active); children
 * icons never re-specify it.
 */
function PromptInputButton({
  active = false,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { active?: boolean }) {
  return (
    <TextClassContext.Provider value={cn('text-muted-foreground', active && 'text-foreground')}>
      <Button
        variant="ghost"
        size="icon"
        className={cn('size-11', active && 'bg-accent', className)}
        accessibilityState={{ selected: active }}
        {...props}
      >
        {children}
      </Button>
    </TextClassContext.Provider>
  );
}

/**
 * The paperclip. Opens the picker the `accept` prop routes to (media, or documents).
 * KEPT for direct-open consumers and web parity — it leaves the DEFAULT pose in favor
 * of the + menu (PromptInputToolsMenuTrigger), but nothing about it changed.
 */
function PromptInputActionAddAttachments({
  className,
  ...props
}: Omit<React.ComponentProps<typeof PromptInputButton>, 'onPress' | 'children'>) {
  const { openPicker } = usePromptInputAttachments();
  return (
    <PromptInputButton
      onPress={() => openPicker()}
      accessibilityLabel="Add photos and files"
      className={className}
      {...props}
    >
      <Icon as={PaperclipIcon} size={20} />
    </PromptInputButton>
  );
}

/* ------------------------------------------------------------- tools menu -- */

/**
 * The + menu — the composer's ONE rest entry point (progressive disclosure): a house
 * bottom Sheet whose rows are CONSUMER CHILDREN. The menu is content-agnostic — it
 * knows nothing about cameras, files or web search; it renders whatever Item rows you
 * give it. A dialog with no title is an a11y hole (command precedent), so a
 * SheetTitle always renders.
 *
 * Controlled only: the trigger sits in the tools ROW (next to the model chip) while
 * this portals full-width from the bottom edge — one `open` state, owned by the
 * consumer, wires both. THE PORTAL BREAKS REACT CONTEXT: the rows render inside the
 * portaled SheetContent, where no provider above this component is visible (measured
 * on device — a context-reading Item threw the moment the sheet opened). So rows are
 * DUMB: they render exactly what you pass and fire your onPress; they never
 * auto-close. Close the menu inside your own onPress via your own onOpenChange
 * (fire your handler first, then close — a handler that opens a picker must not
 * race the sheet's exit). Anything overlay-shaped opened FROM these rows must
 * target the sheet's own portal host (pass `portalHostName` and hand it to the
 * nested overlay's `portalHost`), or it renders silently behind the sheet.
 */
type PromptInputToolsMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The sheet's screen-reader title. */
  title?: string;
  /** Unique host name — set it when you nest an overlay inside the rows. */
  portalHostName?: string;
  className?: string;
  children?: React.ReactNode;
};

function PromptInputToolsMenu({
  open,
  onOpenChange,
  title = 'Add content and tools',
  portalHostName,
  className,
  children,
}: PromptInputToolsMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" portalHostName={portalHostName} className={className}>
        <SheetTitle className="text-base font-semibold text-foreground">{title}</SheetTitle>
        <View className="gap-1">{children}</View>
      </SheetContent>
    </Sheet>
  );
}

/**
 * The +: the single always-visible tools affordance. A 44pt ghost button (the
 * house floor) that opens the controlled menu — `expanded` is the consumer's menu
 * `open`, fed straight into accessibilityState.
 */
type PromptInputToolsMenuTriggerProps = Omit<
  React.ComponentProps<typeof PromptInputButton>,
  'children' | 'onPress'
> & {
  onPress: () => void;
  /** Pass the menu's `open` — it drives accessibilityState.expanded. */
  expanded?: boolean;
};

function PromptInputToolsMenuTrigger({
  expanded = false,
  className,
  ...props
}: PromptInputToolsMenuTriggerProps) {
  return (
    <PromptInputButton
      accessibilityLabel="Add content and tools"
      accessibilityState={{ expanded }}
      className={className}
      {...props}
    >
      <Icon as={PlusIcon} size={20} />
    </PromptInputButton>
  );
}

/**
 * One menu row — ChatGPT's icon-chip anatomy: the icon in a muted 32px chip, the
 * label, then the check-trailing-row pattern from model-selector's renderRow (a
 * reserved 16px slot keeps rows from shifting when `selected` flips). The toggle
 * STATE is the consumer's; the menu only displays it. Press fires the consumer's
 * handler first, then closes the sheet — ordering matters: a handler that opens a
 * picker must not race the sheet's exit.
 */
type PromptInputToolsMenuItemProps = {
  icon: LucideIcon;
  label: string;
  /** Renders the trailing check (toggle state is consumer-owned). */
  selected?: boolean;
  onPress: () => void;
  className?: string;
};

function PromptInputToolsMenuItem({
  icon,
  label,
  selected = false,
  onPress,
  className,
}: PromptInputToolsMenuItemProps) {
  // Dumb row on purpose — see the portal note on PromptInputToolsMenu: the sheet's
  // portal boundary carries no React context, so this row can neither see nor close
  // the menu. Fire the consumer's handler; the consumer closes via its own
  // onOpenChange inside that handler.
  return (
    <Item
      variant={selected ? 'muted' : 'default'}
      onPress={onPress}
      className={className}
    >
      <ItemMedia>
        <View className="size-8 items-center justify-center rounded-md bg-muted">
          <Icon as={icon} size={16} className="text-muted-foreground" />
        </View>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{label}</ItemTitle>
      </ItemContent>
      {selected ? (
        <Icon as={CheckIcon} size={16} className="ml-auto" />
      ) : (
        <View className="ml-auto size-4" />
      )}
    </Item>
  );
}

/**
 * Horizontal chip row — the house law (scroll, never wrap; wrap would stretch the
 * field's height under the open keyboard). Null when empty: zero height, no seam.
 */
function PromptInputAttachments({
  contentContainerClassName,
  ...props
}: React.ComponentProps<typeof ScrollView>) {
  const { files, remove } = usePromptInputAttachments();
  if (files.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName={cn('flex-row gap-2 py-1', contentContainerClassName)}
      {...props}
    >
      {files.map((file) => (
        <PromptInputAttachment
          key={file.id}
          file={file}
          onRemove={() => remove(file.id)}
        />
      ))}
    </ScrollView>
  );
}

/** The chip — one anatomy; the image thumbnail and the file-icon box swap places. */
function PromptInputAttachment({
  file,
  onRemove,
  className,
}: {
  file: PromptInputAttachmentData;
  onRemove: () => void;
  className?: string;
}) {
  const isImage = getMediaCategory(file.mediaType) === 'image';
  return (
    <View
      className={cn(
        'flex-row items-center gap-2 rounded-md border border-border bg-muted p-1',
        className,
      )}
    >
      {isImage ? (
        <Image source={{ uri: file.url }} className="size-8 rounded-md bg-muted" />
      ) : (
        <View className="size-8 items-center justify-center rounded-md bg-muted">
          <Icon as={FileIcon} size={16} className="text-muted-foreground" />
        </View>
      )}
      <Text numberOfLines={1} className="max-w-24 truncate text-sm text-foreground">
        {file.filename}
      </Text>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        // Slop, not a bigger button: the 44pt target without stretching the 40px chip.
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        onPress={onRemove}
        accessibilityLabel={`Remove ${file.filename}`}
      >
        <Icon as={XIcon} size={16} className="text-muted-foreground" />
      </Button>
    </View>
  );
}

/**
 * Status-aware submit. The status arrives from the ROOT's props (context) — the
 * consumer sets it once on PromptInput and every part reads it, the RN divergence
 * from the web's per-button status prop.
 *
 * ready → ArrowUp (the explicit-send idiom — see header), submitted → spinner,
 * streaming → stop, error → X, non-interactive. Disabled when there is nothing to
 * send and nothing is generating (the web docs' disabled={!text && !status}).
 */
function PromptInputSubmit({ className, ...props }: Omit<React.ComponentProps<typeof Button>, 'children' | 'onPress'>) {
  const field = usePromptInputField();
  const isGenerating = field.status === 'submitted' || field.status === 'streaming';
  const canSend = field.text.trim().length > 0 && !field.busy;
  const disabled = field.status === 'error' ? true : isGenerating ? false : !canSend;
  return (
    <Button
      variant="default"
      size="icon"
      className={cn('ml-auto size-11 rounded-xl', className)}
      disabled={disabled}
      onPress={isGenerating && field.onStop ? field.onStop : field.submit}
      accessibilityLabel={isGenerating ? 'Stop generating' : 'Send message'}
      {...props}
    >
      {field.status === 'submitted' ? (
        <ActivityIndicator size="small" />
      ) : field.status === 'streaming' ? (
        <Icon as={SquareIcon} size={16} />
      ) : field.status === 'error' ? (
        <Icon as={XIcon} size={16} />
      ) : (
        <Icon as={ArrowUpIcon} size={20} />
      )}
    </Button>
  );
}

/**
 * The primary slot, right side, FIXED at 44pt — the never-dead control (the spec's
 * morph table). Every state is an in-place swap inside the fixed slot, so the
 * keyboard-avoided field never reflows (AC-1/AC-2 deterministic):
 *
 *   streaming/error/submitted or text present → the EXACT PromptInputSubmit branches
 *   (delegated verbatim — zero duplication of the status map);
 *   empty + renderVoice composed              → the consumer's voice affordance;
 *   empty + no voice                          → today's disabled send arrow.
 *
 * `renderVoice` mirrors SpeechInput's caller-supplied recorder/transcribe contract:
 * the registry stays engineless and never fake-listens. The voice affordance must
 * present as the filled primary circle (SpeechInput's idle pill IS the reference).
 * PromptInputSubmit stays exported and unchanged — this is an additive part.
 */
type PromptInputPrimaryProps = Omit<React.ComponentProps<typeof Button>, 'children' | 'onPress'> & {
  /** The empty-field voice affordance — composed by the consumer, engineless. */
  renderVoice?: () => React.ReactNode;
};

function PromptInputPrimary({ renderVoice, className, ...props }: PromptInputPrimaryProps) {
  const field = usePromptInputField();
  const isGenerating = field.status === 'submitted' || field.status === 'streaming';
  // Voice owns the slot ONLY while there is nothing to send and nothing in flight —
  // the moment text exists, submit is the fastest path back (the morph table's
  // "text ready → send" row wins without a re-render boundary).
  const voiceOwns =
    renderVoice != null &&
    !isGenerating &&
    field.status !== 'error' &&
    !field.busy &&
    field.text.trim().length === 0;
  return (
    <View className={cn('ml-auto size-11 items-center justify-center', className)}>
      {voiceOwns ? (
        renderVoice()
      ) : (
        // Delegation, not reimplementation: its own ml-auto/size-11 are inert inside
        // this fixed slot — the status map, the stop wiring, the disabled logic are
        // byte-identical to the standalone part.
        <PromptInputSubmit {...props} />
      )}
    </View>
  );
}

export {
  PromptInput,
  PromptInputProvider,
  usePromptInputController,
  usePromptInputAttachments,
  PromptInputHeader,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputActionAddAttachments,
  PromptInputToolsMenu,
  PromptInputToolsMenuTrigger,
  PromptInputToolsMenuItem,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputSubmit,
  PromptInputPrimary,
};
