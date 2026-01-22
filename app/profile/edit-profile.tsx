// app/profile/edit-profile.tsx - Phase 4: Profile Editing Screen
// Allows users to edit their profile information

import { useAuth } from '@/context/AuthContext';
import { lightTap, mediumTap, successTap } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Placeholder avatar
import UserAvatar from '../../assets/images/user.png';

// Form validation types
interface FormData {
    displayName: string;
    email: string;
    phoneNumber: string;
    language: string;
    location: {
        city: string;
        area: string;
    };
}

interface FormErrors {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
}

export default function EditProfileScreen() {
    const { userProfile, updateUserProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Form state
    const [formData, setFormData] = useState<FormData>({
        displayName: '',
        email: '',
        phoneNumber: '',
        language: 'en',
        location: {
            city: '',
            area: '',
        },
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // Load user data on mount
    useEffect(() => {
        if (userProfile) {
            setFormData({
                displayName: userProfile.displayName || userProfile.name || '',
                email: userProfile.email || '',
                phoneNumber: userProfile.phoneNumber || '',
                language: userProfile.language || 'en',
                location: userProfile.location || { city: '', area: '' },
            });
            setAvatarUri(userProfile.avatarUrl || userProfile.photoURL || null);
        }
    }, [userProfile]);

    // Track changes
    useEffect(() => {
        if (userProfile) {
            const originalData = {
                displayName: userProfile.displayName || userProfile.name || '',
                email: userProfile.email || '',
                phoneNumber: userProfile.phoneNumber || '',
                language: userProfile.language || 'en',
                location: userProfile.location || { city: '', area: '' },
            };

            const changed =
                formData.displayName !== originalData.displayName ||
                formData.email !== originalData.email ||
                formData.language !== originalData.language ||
                formData.location.city !== originalData.location.city ||
                formData.location.area !== originalData.location.area ||
                avatarUri !== (userProfile.avatarUrl || userProfile.photoURL || null);

            setHasChanges(changed);
        }
    }, [formData, avatarUri, userProfile]);

    // Validation
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Name validation
        if (!formData.displayName.trim()) {
            newErrors.displayName = 'Name is required';
        } else if (formData.displayName.trim().length < 2) {
            newErrors.displayName = 'Name must be at least 2 characters';
        }

        // Email validation (optional but must be valid if provided)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle avatar selection
    const handleSelectAvatar = async () => {
        lightTap();

        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please allow access to your photo library to change your profile picture.',
                [{ text: 'OK' }]
            );
            return;
        }

        // Show options
        Alert.alert('Change Profile Picture', 'Choose an option', [
            {
                text: 'Take Photo',
                onPress: async () => {
                    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
                    if (cameraStatus.status !== 'granted') {
                        Alert.alert('Permission Required', 'Camera access is required to take photos.');
                        return;
                    }

                    const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.8,
                    });

                    if (!result.canceled && result.assets[0]) {
                        setAvatarUri(result.assets[0].uri);
                    }
                },
            },
            {
                text: 'Choose from Library',
                onPress: async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.8,
                    });

                    if (!result.canceled && result.assets[0]) {
                        setAvatarUri(result.assets[0].uri);
                    }
                },
            },
            {
                text: 'Remove Photo',
                style: 'destructive',
                onPress: () => {
                    setAvatarUri(null);
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    // Handle save
    const handleSave = async () => {
        if (!validateForm()) {
            mediumTap();
            return;
        }

        setIsSaving(true);
        try {
            // Prepare update data
            const updateData: Partial<typeof userProfile> = {
                displayName: formData.displayName.trim(),
                name: formData.displayName.trim(), // Keep for backward compatibility
                email: formData.email.trim() || undefined,
                language: formData.language,
                location: formData.location,
            };

            // If avatar changed, upload it first
            if (avatarUri && avatarUri !== userProfile?.avatarUrl && avatarUri !== userProfile?.photoURL) {
                // TODO: Upload avatar to Firebase Storage
                // For now, just store the local URI (will be replaced with actual upload)
                updateData.avatarUrl = avatarUri;
                updateData.photoURL = avatarUri;
            } else if (!avatarUri) {
                // Avatar removed
                updateData.avatarUrl = undefined;
                updateData.photoURL = undefined;
            }

            // Update profile
            if (updateUserProfile) {
                await updateUserProfile(updateData);
            }

            successTap();
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle discard changes
    const handleBack = () => {
        if (hasChanges) {
            Alert.alert('Discard Changes?', 'You have unsaved changes. Are you sure you want to go back?', [
                { text: 'Stay', style: 'cancel' },
                {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => router.back(),
                },
            ]);
        } else {
            router.back();
        }
    };

    // Update form field
    const updateField = (field: keyof FormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    // Update location field
    const updateLocation = (field: 'city' | 'area', value: string) => {
        setFormData((prev) => ({
            ...prev,
            location: { ...prev.location, [field]: value },
        }));
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2DA8FF" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#2DA8FF', '#EAF6FF']} style={styles.gradient}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!hasChanges || isSaving}
                        style={[styles.saveBtn, (!hasChanges || isSaving) && styles.saveBtnDisabled]}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#2DA8FF" />
                        ) : (
                            <Text style={[styles.saveBtnText, !hasChanges && styles.saveBtnTextDisabled]}>
                                Save
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Avatar Section */}
                        <View style={styles.avatarSection}>
                            <TouchableOpacity onPress={handleSelectAvatar} style={styles.avatarContainer}>
                                <Image
                                    source={avatarUri ? { uri: avatarUri } : UserAvatar}
                                    style={styles.avatar}
                                />
                                <View style={styles.cameraIcon}>
                                    <Ionicons name="camera" size={18} color="#fff" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSelectAvatar}>
                                <Text style={styles.changePhotoText}>Change Photo</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form Section */}
                        <View style={styles.formSection}>
                            {/* Name Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name *</Text>
                                <View style={[styles.inputContainer, errors.displayName && styles.inputError]}>
                                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.displayName}
                                        onChangeText={(text) => updateField('displayName', text)}
                                        placeholder="Enter your full name"
                                        placeholderTextColor="#999"
                                        autoCapitalize="words"
                                    />
                                </View>
                                {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.email}
                                        onChangeText={(text) => updateField('email', text)}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#999"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                            </View>

                            {/* Phone Number (Read-only) */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number</Text>
                                <View style={[styles.inputContainer, styles.inputDisabled]}>
                                    <Ionicons name="call-outline" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputTextDisabled]}
                                        value={formData.phoneNumber}
                                        editable={false}
                                        placeholder="Phone number"
                                        placeholderTextColor="#999"
                                    />
                                    <Ionicons name="lock-closed-outline" size={16} color="#999" />
                                </View>
                                <Text style={styles.helperText}>Phone number cannot be changed</Text>
                            </View>

                            {/* Location Section */}
                            <View style={styles.sectionHeader}>
                                <Ionicons name="location-outline" size={20} color="#2DA8FF" />
                                <Text style={styles.sectionTitle}>Location</Text>
                            </View>

                            {/* City Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>City</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.location.city}
                                        onChangeText={(text) => updateLocation('city', text)}
                                        placeholder="Enter your city"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>

                            {/* Area Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Area / Neighborhood</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="map-outline" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.location.area}
                                        onChangeText={(text) => updateLocation('area', text)}
                                        placeholder="Enter your area"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>

                            {/* Language Selection */}
                            <View style={styles.sectionHeader}>
                                <Ionicons name="language-outline" size={20} color="#2DA8FF" />
                                <Text style={styles.sectionTitle}>Language Preference</Text>
                            </View>

                            <View style={styles.languageOptions}>
                                <TouchableOpacity
                                    style={[
                                        styles.languageOption,
                                        formData.language === 'en' && styles.languageOptionSelected,
                                    ]}
                                    onPress={() => {
                                        lightTap();
                                        updateField('language', 'en');
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.languageText,
                                            formData.language === 'en' && styles.languageTextSelected,
                                        ]}
                                    >
                                        🇬🇧 English
                                    </Text>
                                    {formData.language === 'en' && (
                                        <Ionicons name="checkmark-circle" size={20} color="#2DA8FF" />
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.languageOption,
                                        formData.language === 'ne' && styles.languageOptionSelected,
                                    ]}
                                    onPress={() => {
                                        lightTap();
                                        updateField('language', 'ne');
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.languageText,
                                            formData.language === 'ne' && styles.languageTextSelected,
                                        ]}
                                    >
                                        🇳🇵 नेपाली
                                    </Text>
                                    {formData.language === 'ne' && (
                                        <Ionicons name="checkmark-circle" size={20} color="#2DA8FF" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Profile Completion */}
                            {userProfile?.profileCompletionScore !== undefined && (
                                <View style={styles.completionCard}>
                                    <View style={styles.completionHeader}>
                                        <Ionicons name="shield-checkmark-outline" size={20} color="#22c55e" />
                                        <Text style={styles.completionTitle}>Profile Completion</Text>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${userProfile.profileCompletionScore}%` },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.completionText}>
                                        {userProfile.profileCompletionScore}% complete
                                    </Text>
                                </View>
                            )}

                            {/* Account Info */}
                            <View style={styles.accountInfo}>
                                <Text style={styles.accountInfoTitle}>Account Information</Text>
                                <View style={styles.accountInfoRow}>
                                    <Text style={styles.accountInfoLabel}>Member since</Text>
                                    <Text style={styles.accountInfoValue}>
                                        {userProfile?.createdAt
                                            ? new Date(userProfile.createdAt.toDate?.() || userProfile.createdAt).toLocaleDateString()
                                            : 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.accountInfoRow}>
                                    <Text style={styles.accountInfoLabel}>Account status</Text>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            userProfile?.status === 'active' && styles.statusActive,
                                            userProfile?.status === 'suspended' && styles.statusSuspended,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,
                                                userProfile?.status === 'active' && styles.statusTextActive,
                                                userProfile?.status === 'suspended' && styles.statusTextSuspended,
                                            ]}
                                        >
                                            {userProfile?.status || 'Active'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Bottom Spacer */}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    gradient: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 50,
        paddingBottom: 15,
    },
    backBtn: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    saveBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    saveBtnDisabled: {
        opacity: 0.5,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2DA8FF',
    },
    saveBtnTextDisabled: {
        color: '#999',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2DA8FF',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    changePhotoText: {
        marginTop: 12,
        fontSize: 16,
        color: '#2DA8FF',
        fontWeight: '600',
    },
    formSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    inputDisabled: {
        backgroundColor: '#f0f0f0',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    inputTextDisabled: {
        color: '#999',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
    helperText: {
        color: '#999',
        fontSize: 12,
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    languageOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    languageOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    languageOptionSelected: {
        borderColor: '#2DA8FF',
        backgroundColor: '#EAF6FF',
    },
    languageText: {
        fontSize: 16,
        color: '#666',
    },
    languageTextSelected: {
        color: '#2DA8FF',
        fontWeight: '600',
    },
    completionCard: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#f0fdf4',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    completionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    completionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#22c55e',
        marginLeft: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#dcfce7',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#22c55e',
        borderRadius: 4,
    },
    completionText: {
        marginTop: 8,
        fontSize: 12,
        color: '#16a34a',
        textAlign: 'right',
    },
    accountInfo: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
    },
    accountInfoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    accountInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    accountInfoLabel: {
        fontSize: 14,
        color: '#666',
    },
    accountInfoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#e0e0e0',
    },
    statusActive: {
        backgroundColor: '#dcfce7',
    },
    statusSuspended: {
        backgroundColor: '#fee2e2',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textTransform: 'capitalize',
    },
    statusTextActive: {
        color: '#22c55e',
    },
    statusTextSuspended: {
        color: '#ef4444',
    },
});
