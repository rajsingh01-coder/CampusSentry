import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, ArrowLeft, CheckCircle2, CircleHelp, Clock3, Shield, XCircle } from 'lucide-react-native';
import { router } from 'expo-router';

import { VisitorStatus } from '@/providers/demo-data-provider';
import { useAppTheme } from '@/providers/theme-provider';

export function Page({ children, contentStyle }: React.PropsWithChildren<{ contentStyle?: StyleProp<ViewStyle> }>) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, contentStyle]}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ScreenTitle({
  title,
  subtitle,
  back = false,
  backFallback = '/(tabs)',
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  backFallback?: '/(tabs)' | '/(tabs)/requests';
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.titleRow}>
      {back && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(backFallback);
            }
          }}
          style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
      )}
      <View style={styles.titleCopy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <View style={[styles.brandMark, { width: size, height: size, borderRadius: Math.round(size * 0.28) }]}>
      <Shield size={size * 0.52} color="#FFFFFF" strokeWidth={2.1} />
    </View>
  );
}

export function Card({ children, style }: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { colors } = useAppTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>;
}

export function DemoBanner({ children = 'Demo data · Not connected to a live backend' }: React.PropsWithChildren) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.demoBanner, { backgroundColor: colors.navy, borderColor: colors.navy }]}>
      <View style={[styles.demoDot, { backgroundColor: '#60A5FA' }]} />
      <Text style={styles.demoText}>{children}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  const backgroundColor = variant === 'primary'
    ? colors.primary
    : variant === 'danger'
      ? colors.critical
      : colors.surface;
  const foregroundColor = variant === 'secondary' ? colors.text : colors.onPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor: variant === 'secondary' ? colors.border : backgroundColor },
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={foregroundColor} /> : <Text style={[styles.buttonText, { color: foregroundColor }]}>{label}</Text>}
    </Pressable>
  );
}

export function StatusBadge({ status }: { status: VisitorStatus | string }) {
  const { colors } = useAppTheme();
  const tone = status === 'Approved' || status === 'Checked In'
    ? colors.success
    : status === 'Rejected'
      ? colors.critical
      : status === 'Pending' || status === 'Pending Approval' || status === 'Verification Required'
        ? colors.warning
        : status === 'Cancelled' || status === 'Expired' || status === 'Checked Out'
          ? colors.muted
        : colors.info;
  const Icon = status === 'Approved' || status === 'Checked In'
    ? CheckCircle2
    : status === 'Rejected' || status === 'Cancelled'
      ? XCircle
      : status === 'Expired' || status === 'Pending' || status === 'Pending Verification' || status === 'Pending Approval'
        ? Clock3
      : status === 'Verification Required'
        ? AlertTriangle
        : status === 'Checked Out'
          ? CheckCircle2
          : CircleHelp;
  return (
    <View accessibilityRole="text" accessibilityLabel={status} style={[styles.statusBadge, { backgroundColor: `${tone}18`, borderColor: `${tone}55` }]}>
      <Icon size={14} color={tone} />
      <Text style={[styles.statusText, { color: tone }]}>{status}</Text>
    </View>
  );
}

export function IdentityBadge({ status }: { status: 'Known' | 'Unknown' | 'Verification Required' }) {
  const { colors } = useAppTheme();
  const tone = status === 'Known' ? colors.success : status === 'Verification Required' ? colors.warning : colors.muted;
  const Icon = status === 'Known' ? CheckCircle2 : status === 'Verification Required' ? AlertTriangle : CircleHelp;
  return (
    <View accessibilityRole="text" accessibilityLabel={`Identity: ${status}`} style={[styles.statusBadge, { backgroundColor: `${tone}18`, borderColor: `${tone}55` }]}>
      <Icon size={14} color={tone} />
      <Text style={[styles.statusText, { color: tone }]}>{status}</Text>
    </View>
  );
}

export function Field({
  label,
  error,
  style,
  ...props
}: TextInputProps & { label: string; error?: string; style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        style={[
          styles.input,
          { color: colors.text, backgroundColor: colors.surface, borderColor: error ? colors.critical : colors.border },
          props.multiline ? styles.multiline : null,
        ]}
      />
      {error ? <Text style={[styles.fieldError, { color: colors.critical }]}>{error}</Text> : null}
    </View>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: React.ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scroll: { width: '100%' },
  scrollContent: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 20, paddingBottom: 32, gap: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 2 },
  titleCopy: { flex: 1, gap: 4 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.6 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  backButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  brandMark: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB' },
  card: { padding: 16, borderWidth: 1, borderRadius: 16, gap: 12 },
  demoBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  demoDot: { width: 7, height: 7, borderRadius: 4 },
  demoText: { flex: 1, color: '#CBD5E1', fontSize: 12, lineHeight: 17, fontWeight: '500' },
  button: { minHeight: 50, borderWidth: 1, borderRadius: 13, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
  statusBadge: { alignSelf: 'flex-start', minHeight: 28, paddingHorizontal: 9, borderWidth: 1, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  field: { gap: 7 },
  fieldLabel: { fontSize: 14, fontWeight: '600' },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, fontSize: 15 },
  multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  fieldError: { fontSize: 12, lineHeight: 17 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
});
