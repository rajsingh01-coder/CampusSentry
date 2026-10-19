import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DemoBanner, Field, Page, PrimaryButton, ScreenTitle } from '@/components/ui';
import { apiRequest } from '@/lib/api';
import { VisitorCategory, useDemoData } from '@/providers/demo-data-provider';
import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/providers/theme-provider';

const categories: VisitorCategory[] = ['Parent/Guardian', 'Guest', 'Vendor', 'Other'];

export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const { mode, token } = useAuth();
  const { registerVisitor, refresh } = useDemoData();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<VisitorCategory>('Guest');
  const [purpose, setPurpose] = useState('');
  const [personToMeet, setPersonToMeet] = useState('');
  const [department, setDepartment] = useState('');
  const [appointment, setAppointment] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedRequestId, setSavedRequestId] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error' | 'success'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const submit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Enter the visitor’s full name.';
    if (!/^[+\d][\d\s()+-]{7,19}$/.test(phone.trim())) nextErrors.phone = 'Enter a valid phone number.';
    if (!purpose.trim()) nextErrors.purpose = 'Enter the purpose of the visit.';
    if (!personToMeet.trim()) nextErrors.person = 'Enter a person or department to meet.';
    if (!department.trim()) nextErrors.department = 'Enter the department to meet.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitState('submitting');
    setSubmitMessage('');

    try {
      if (mode === 'demo') {
        const requestId = registerVisitor({
          name: name.trim(),
          phone: phone.trim(),
          category,
          purpose: purpose.trim(),
          personToMeet: personToMeet.trim(),
          appointmentDetails: appointment.trim() || undefined,
        });
        setSavedRequestId(requestId);
        setSubmitState('success');
        setSubmitMessage(`${requestId} was saved in this device's demo data only.`);
        return;
      }
      if (!token) throw new Error('Sign in with a campus account before submitting a visitor request.');

      const payload = await apiRequest<{ _id: string }>(
        '/api/visitors',
        {
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            category,
            purpose: purpose.trim(),
            personToMeet: personToMeet.trim(),
            department: department.trim(),
          }),
        },
        token,
      );

      if (!payload?._id) throw new Error('The backend accepted the request but did not return its visitor ID.');
      await refresh();
      setSavedRequestId(payload._id);
      setSubmitState('success');
      setSubmitMessage(`Visitor request ${payload._id} was saved by the backend.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit visitor request.';
      setSubmitState('error');
      setSubmitMessage(message);
    }
  };

  return (
    <Page>
      <ScreenTitle title="Register visitor" subtitle="Create a walk-in visitor request." back />
      {mode === 'demo' ? <DemoBanner>Demo form · Submission is stored on this device only</DemoBanner> : null}
      {savedRequestId ? (
        <View style={[styles.successCard, { backgroundColor: `${colors.success}14`, borderColor: `${colors.success}66` }]}>
          <Text style={[styles.successTitle, { color: colors.success }]}>{mode === 'demo' ? 'Saved in demo mode' : 'Visitor request submitted'}</Text>
          <Text style={[styles.successCopy, { color: colors.muted }]}>{submitMessage}</Text>
          <PrimaryButton label="View requests" onPress={() => router.replace('/(tabs)/requests')} />
        </View>
      ) : null}

      <Field label="Visitor full name *" placeholder="e.g. Aditi Sharma" value={name} onChangeText={setName} autoCapitalize="words" error={errors.name} />
      <Field label="Mobile number *" placeholder="+91 98765 43210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.phone} />

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Visitor category *</Text>
        <View style={styles.categories}>
          {categories.map((item) => {
            const selected = category === item;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.category, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? `${colors.primary}15` : colors.surface }]}
              >
                <Text style={[styles.categoryText, { color: selected ? colors.primary : colors.text }]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Field label="Purpose of visit *" placeholder="Briefly describe the visit" value={purpose} onChangeText={setPurpose} multiline error={errors.purpose} />
      <Field label="Person or department to meet *" placeholder="e.g. Dean of Engineering" value={personToMeet} onChangeText={setPersonToMeet} autoCapitalize="words" error={errors.person} />
      <Field label="Department *" placeholder="e.g. Engineering / Admin" value={department} onChangeText={setDepartment} autoCapitalize="words" error={errors.department} />
      {mode === 'demo' ? <Field label="Appointment details (optional)" placeholder="Appointment time or reference" value={appointment} onChangeText={setAppointment} multiline /> : null}

      <View style={[styles.otpCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Text style={[styles.otpTitle, { color: colors.text }]}>OTP verification</Text>
        <Text style={[styles.otpCopy, { color: colors.muted }]}>The backend OTP endpoints currently simulate delivery and are not connected to visitor verification, so these actions remain disabled.</Text>
        <Field label="Visitor OTP (not connected)" placeholder="OTP verification is unavailable" value={otpCode} onChangeText={setOtpCode} keyboardType="number-pad" maxLength={8} editable={false} />
        <View style={styles.otpActions}>
          <PrimaryButton label="Verify OTP" disabled onPress={() => undefined} variant="secondary" style={styles.otpAction} />
          <PrimaryButton label="Resend OTP" disabled onPress={() => undefined} variant="secondary" style={styles.otpAction} />
        </View>
      </View>

      {submitMessage ? (
        <Text style={[styles.submitNotice, { color: submitState === 'error' ? colors.critical : colors.success }]}>{submitMessage}</Text>
      ) : null}
      {mode === 'demo' ? (
        <Text style={[styles.note, { color: colors.muted }]}>This local demo request is marked Verification Required and Pending. It does not grant campus access.</Text>
      ) : null}
      <PrimaryButton label={submitState === 'submitting' ? 'Submitting…' : mode === 'demo' ? 'Save demo request' : 'Submit visitor request'} disabled={Boolean(savedRequestId) || submitState === 'submitting'} onPress={submit} />
      <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
    </Page>
  );
}

const styles = StyleSheet.create({
  fieldGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  category: { minHeight: 44, borderWidth: 1, borderRadius: 22, paddingHorizontal: 12, justifyContent: 'center' },
  categoryText: { fontSize: 12, fontWeight: '600' },
  otpCard: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 11 },
  otpTitle: { fontSize: 15, fontWeight: '700' },
  otpCopy: { fontSize: 12, lineHeight: 18 },
  note: { fontSize: 12, lineHeight: 18 },
  successCard: { borderWidth: 1, borderRadius: 15, padding: 13, gap: 9 },
  successTitle: { fontSize: 14, fontWeight: '700' },
  successCopy: { fontSize: 12, lineHeight: 18 },
  submitNotice: { fontSize: 12, lineHeight: 18 },
  otpActions: { flexDirection: 'row', gap: 8 },
  otpAction: { flex: 1 },
});
