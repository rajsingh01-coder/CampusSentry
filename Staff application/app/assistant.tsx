import { router } from 'expo-router';
import { ArrowUp, Bot, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, DemoBanner, Page, ScreenTitle } from '@/components/ui';
import { useAppTheme } from '@/providers/theme-provider';

const suggestions = [
  'Show pending requests',
  'Register a new visitor',
  'Identify this visitor',
  'Find today’s visitor records',
  'Start visitor verification',
];

export default function AssistantScreen() {
  const { colors } = useAppTheme();
  const [prompt, setPrompt] = useState('');
  const [submittedPrompt, setSubmittedPrompt] = useState('');

  const submit = () => {
    if (!prompt.trim()) return;
    setSubmittedPrompt(prompt.trim());
    setPrompt('');
  };

  return (
    <Page contentStyle={styles.page}>
      <ScreenTitle title="AI assistant" subtitle="Staff help for visitor workflows." back />
      <DemoBanner>Assistant service is not connected · No actions will be performed</DemoBanner>

      <View style={styles.intro}>
        <View style={[styles.botIcon, { backgroundColor: `${colors.primary}16` }]}><Bot size={24} color={colors.primary} /></View>
        <Text style={[styles.heading, { color: colors.text }]}>How can I help?</Text>
        <Text style={[styles.copy, { color: colors.muted }]}>Ask about a visitor workflow. Prompts stay on this screen; no AI request is sent.</Text>
      </View>

      <View style={styles.suggestions}>
        {suggestions.map((item) => (
          <Pressable accessibilityRole="button" accessibilityLabel={`Use suggestion: ${item}`} key={item} onPress={() => setPrompt(item)} style={[styles.suggestion, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Sparkles size={15} color={colors.primary} />
            <Text style={[styles.suggestionText, { color: colors.text }]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {submittedPrompt ? (
        <View style={styles.chat}>
          <View style={[styles.userMessage, { backgroundColor: colors.primary }]}>
            <Text style={styles.userText}>{submittedPrompt}</Text>
          </View>
          <Card style={styles.response}>
            <Bot size={18} color={colors.primary} />
            <Text style={[styles.responseText, { color: colors.text }]}>
              The AI assistant backend is not configured. I did not look up records or perform an action. Use the app’s Requests, Register, or Identify screens instead.
            </Text>
          </Card>
          {submittedPrompt.toLowerCase().includes('register') ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/register')} style={[styles.openAction, { borderColor: colors.border }]}>
              <Text style={[styles.openActionText, { color: colors.primary }]}>Open registration form</Text>
            </Pressable>
          ) : null}
          {submittedPrompt.toLowerCase().includes('identify') ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/identify')} style={[styles.openAction, { borderColor: colors.border }]}>
              <Text style={[styles.openActionText, { color: colors.primary }]}>Open identity verification</Text>
            </Pressable>
          ) : null}
          {submittedPrompt.toLowerCase().includes('verification') ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/identify')} style={[styles.openAction, { borderColor: colors.border }]}>
              <Text style={[styles.openActionText, { color: colors.primary }]}>Start manual verification</Text>
            </Pressable>
          ) : null}
          {submittedPrompt.toLowerCase().includes('pending') ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/requests')} style={[styles.openAction, { borderColor: colors.border }]}>
              <Text style={[styles.openActionText, { color: colors.primary }]}>Open requests</Text>
            </Pressable>
          ) : null}
          {submittedPrompt.toLowerCase().includes('record') ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/records')} style={[styles.openAction, { borderColor: colors.border }]}>
              <Text style={[styles.openActionText, { color: colors.primary }]}>Open visitor records</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.composer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          accessibilityLabel="Ask the CampusSentry assistant"
          placeholder="Type a question…"
          placeholderTextColor={colors.muted}
          value={prompt}
          onChangeText={setPrompt}
          onSubmitEditing={submit}
          returnKeyType="send"
          style={[styles.input, { color: colors.text }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Submit prompt"
          disabled={!prompt.trim()}
          onPress={submit}
          style={[styles.sendButton, { backgroundColor: colors.primary }, !prompt.trim() && styles.disabled]}
        >
          <ArrowUp size={18} color={colors.onPrimary} />
        </Pressable>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1 },
  intro: { alignItems: 'center', paddingTop: 24, paddingBottom: 5, gap: 11 },
  botIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 21, fontWeight: '700' },
  copy: { maxWidth: 300, textAlign: 'center', fontSize: 13, lineHeight: 19 },
  suggestions: { gap: 8 },
  suggestion: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, borderWidth: 1, borderRadius: 13 },
  suggestionText: { fontSize: 13, fontWeight: '500' },
  chat: { gap: 11, paddingTop: 6 },
  userMessage: { alignSelf: 'flex-end', maxWidth: '88%', padding: 12, borderRadius: 16, borderBottomRightRadius: 4 },
  userText: { color: '#FFFFFF', fontSize: 14 },
  response: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  responseText: { flex: 1, fontSize: 13, lineHeight: 19 },
  openAction: { alignSelf: 'flex-start', minHeight: 40, borderWidth: 1, borderRadius: 11, paddingHorizontal: 12, justifyContent: 'center' },
  openActionText: { fontSize: 13, fontWeight: '600' },
  composer: { minHeight: 56, marginTop: 'auto', borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 8 },
  input: { flex: 1, paddingHorizontal: 8, paddingVertical: 10, fontSize: 14 },
  sendButton: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.45 },
});
