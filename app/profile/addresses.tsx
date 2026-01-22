// app/profile/addresses.tsx - Phase 4: Address Management Screen
// Allows users to manage their saved delivery addresses

import { useAuth } from '@/context/AuthContext';
import { lightTap, mediumTap, successTap } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Address type
interface Address {
    id: string;
    label: string; // Home, Work, Other
    fullAddress: string;
    landmark?: string;
    city: string;
    area: string;
    pincode?: string;
    isDefault: boolean;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

// Sample addresses (replace with actual data from Firestore)
const SAMPLE_ADDRESSES: Address[] = [
    {
        id: '1',
        label: 'Home',
        fullAddress: '123 Main Street, Apartment 4B',
        landmark: 'Near City Mall',
        city: 'Kathmandu',
        area: 'Thamel',
        pincode: '44600',
        isDefault: true,
    },
    {
        id: '2',
        label: 'Work',
        fullAddress: 'Tech Park, Building A, Floor 3',
        landmark: 'Opposite Central Bank',
        city: 'Kathmandu',
        area: 'Durbar Marg',
        pincode: '44600',
        isDefault: false,
    },
];

export default function AddressesScreen() {
    const { userProfile } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>(SAMPLE_ADDRESSES);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    // Handle set as default
    const handleSetDefault = useCallback((addressId: string) => {
        lightTap();
        setAddresses((prev) =>
            prev.map((addr) => ({
                ...addr,
                isDefault: addr.id === addressId,
            }))
        );
        successTap();
    }, []);

    // Handle delete address
    const handleDelete = useCallback((addressId: string) => {
        mediumTap();
        Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
                    successTap();
                },
            },
        ]);
    }, []);

    // Handle edit address
    const handleEdit = useCallback((address: Address) => {
        lightTap();
        setEditingAddress(address);
        setShowAddModal(true);
    }, []);

    // Handle add new address
    const handleAddNew = useCallback(() => {
        lightTap();
        setEditingAddress(null);
        setShowAddModal(true);
    }, []);

    // Render address card
    const renderAddressCard = ({ item }: { item: Address }) => (
        <View style={[styles.addressCard, item.isDefault && styles.addressCardDefault]}>
            {/* Label Badge */}
            <View style={styles.cardHeader}>
                <View style={[styles.labelBadge, getLabelStyle(item.label)]}>
                    <Ionicons name={getLabelIcon(item.label)} size={14} color="#fff" />
                    <Text style={styles.labelText}>{item.label}</Text>
                </View>
                {item.isDefault && (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                    </View>
                )}
            </View>

            {/* Address Details */}
            <Text style={styles.fullAddress}>{item.fullAddress}</Text>
            {item.landmark && (
                <Text style={styles.landmark}>
                    <Ionicons name="flag-outline" size={12} color="#666" /> {item.landmark}
                </Text>
            )}
            <Text style={styles.cityArea}>
                {item.area}, {item.city} {item.pincode && `- ${item.pincode}`}
            </Text>

            {/* Actions */}
            <View style={styles.cardActions}>
                {!item.isDefault && (
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleSetDefault(item.id)}
                    >
                        <Ionicons name="checkmark-circle-outline" size={18} color="#2DA8FF" />
                        <Text style={styles.actionText}>Set Default</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
                    <Ionicons name="create-outline" size={18} color="#666" />
                    <Text style={[styles.actionText, { color: '#666' }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#2DA8FF', '#EAF6FF']} style={styles.gradient}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Saved Addresses</Text>
                    <TouchableOpacity onPress={handleAddNew} style={styles.addBtn}>
                        <Ionicons name="add" size={24} color="#2DA8FF" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2DA8FF" />
                    </View>
                ) : addresses.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="location-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyTitle}>No Saved Addresses</Text>
                        <Text style={styles.emptySubtitle}>
                            Add your delivery addresses for faster checkout
                        </Text>
                        <TouchableOpacity style={styles.addFirstBtn} onPress={handleAddNew}>
                            <LinearGradient
                                colors={['#2DA8FF', '#1E90FF']}
                                style={styles.addFirstBtnGradient}
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={styles.addFirstBtnText}>Add Address</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={addresses}
                        renderItem={renderAddressCard}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={
                            <TouchableOpacity style={styles.addMoreBtn} onPress={handleAddNew}>
                                <Ionicons name="add-circle-outline" size={24} color="#2DA8FF" />
                                <Text style={styles.addMoreText}>Add New Address</Text>
                            </TouchableOpacity>
                        }
                    />
                )}

                {/* Add/Edit Modal */}
                <AddressModal
                    visible={showAddModal}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingAddress(null);
                    }}
                    address={editingAddress}
                    onSave={(address) => {
                        if (editingAddress) {
                            // Update existing
                            setAddresses((prev) =>
                                prev.map((addr) => (addr.id === address.id ? address : addr))
                            );
                        } else {
                            // Add new
                            setAddresses((prev) => [...prev, { ...address, id: Date.now().toString() }]);
                        }
                        setShowAddModal(false);
                        setEditingAddress(null);
                        successTap();
                    }}
                />
            </LinearGradient>
        </View>
    );
}

// Helper functions
function getLabelIcon(label: string): any {
    switch (label.toLowerCase()) {
        case 'home':
            return 'home';
        case 'work':
            return 'briefcase';
        default:
            return 'location';
    }
}

function getLabelStyle(label: string): object {
    switch (label.toLowerCase()) {
        case 'home':
            return { backgroundColor: '#22c55e' };
        case 'work':
            return { backgroundColor: '#3b82f6' };
        default:
            return { backgroundColor: '#8b5cf6' };
    }
}

// Address Modal Component
function AddressModal({
    visible,
    onClose,
    address,
    onSave,
}: {
    visible: boolean;
    onClose: () => void;
    address: Address | null;
    onSave: (address: Address) => void;
}) {
    const [formData, setFormData] = useState<Partial<Address>>({
        label: 'Home',
        fullAddress: '',
        landmark: '',
        city: '',
        area: '',
        pincode: '',
        isDefault: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load address data when editing
    React.useEffect(() => {
        if (address) {
            setFormData(address);
        } else {
            setFormData({
                label: 'Home',
                fullAddress: '',
                landmark: '',
                city: '',
                area: '',
                pincode: '',
                isDefault: false,
            });
        }
        setErrors({});
    }, [address, visible]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.fullAddress?.trim()) {
            newErrors.fullAddress = 'Address is required';
        }
        if (!formData.city?.trim()) {
            newErrors.city = 'City is required';
        }
        if (!formData.area?.trim()) {
            newErrors.area = 'Area is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) {
            mediumTap();
            return;
        }
        onSave({
            id: address?.id || '',
            label: formData.label || 'Other',
            fullAddress: formData.fullAddress || '',
            landmark: formData.landmark,
            city: formData.city || '',
            area: formData.area || '',
            pincode: formData.pincode,
            isDefault: formData.isDefault || false,
        });
    };

    const labelOptions = ['Home', 'Work', 'Other'];

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={modalStyles.overlay}>
                <View style={modalStyles.container}>
                    {/* Header */}
                    <View style={modalStyles.header}>
                        <Text style={modalStyles.title}>
                            {address ? 'Edit Address' : 'Add New Address'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Label Selection */}
                        <Text style={modalStyles.label}>Address Type</Text>
                        <View style={modalStyles.labelOptions}>
                            {labelOptions.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[
                                        modalStyles.labelOption,
                                        formData.label === opt && modalStyles.labelOptionSelected,
                                    ]}
                                    onPress={() => {
                                        lightTap();
                                        setFormData((prev) => ({ ...prev, label: opt }));
                                    }}
                                >
                                    <Ionicons
                                        name={getLabelIcon(opt)}
                                        size={18}
                                        color={formData.label === opt ? '#fff' : '#666'}
                                    />
                                    <Text
                                        style={[
                                            modalStyles.labelOptionText,
                                            formData.label === opt && modalStyles.labelOptionTextSelected,
                                        ]}
                                    >
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Full Address */}
                        <Text style={modalStyles.label}>Full Address *</Text>
                        <TextInput
                            style={[modalStyles.input, modalStyles.textArea, errors.fullAddress && modalStyles.inputError]}
                            value={formData.fullAddress}
                            onChangeText={(text) => setFormData((prev) => ({ ...prev, fullAddress: text }))}
                            placeholder="House/Flat No., Building, Street"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                        />
                        {errors.fullAddress && <Text style={modalStyles.errorText}>{errors.fullAddress}</Text>}

                        {/* Landmark */}
                        <Text style={modalStyles.label}>Landmark (Optional)</Text>
                        <TextInput
                            style={modalStyles.input}
                            value={formData.landmark}
                            onChangeText={(text) => setFormData((prev) => ({ ...prev, landmark: text }))}
                            placeholder="Near temple, opposite mall, etc."
                            placeholderTextColor="#999"
                        />

                        {/* City & Area Row */}
                        <View style={modalStyles.row}>
                            <View style={modalStyles.halfInput}>
                                <Text style={modalStyles.label}>City *</Text>
                                <TextInput
                                    style={[modalStyles.input, errors.city && modalStyles.inputError]}
                                    value={formData.city}
                                    onChangeText={(text) => setFormData((prev) => ({ ...prev, city: text }))}
                                    placeholder="City"
                                    placeholderTextColor="#999"
                                />
                                {errors.city && <Text style={modalStyles.errorText}>{errors.city}</Text>}
                            </View>
                            <View style={modalStyles.halfInput}>
                                <Text style={modalStyles.label}>Area *</Text>
                                <TextInput
                                    style={[modalStyles.input, errors.area && modalStyles.inputError]}
                                    value={formData.area}
                                    onChangeText={(text) => setFormData((prev) => ({ ...prev, area: text }))}
                                    placeholder="Area"
                                    placeholderTextColor="#999"
                                />
                                {errors.area && <Text style={modalStyles.errorText}>{errors.area}</Text>}
                            </View>
                        </View>

                        {/* Pincode */}
                        <Text style={modalStyles.label}>Pincode (Optional)</Text>
                        <TextInput
                            style={modalStyles.input}
                            value={formData.pincode}
                            onChangeText={(text) => setFormData((prev) => ({ ...prev, pincode: text }))}
                            placeholder="Postal code"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            maxLength={6}
                        />

                        {/* Default Toggle */}
                        <TouchableOpacity
                            style={modalStyles.defaultToggle}
                            onPress={() => {
                                lightTap();
                                setFormData((prev) => ({ ...prev, isDefault: !prev.isDefault }));
                            }}
                        >
                            <Ionicons
                                name={formData.isDefault ? 'checkbox' : 'square-outline'}
                                size={24}
                                color={formData.isDefault ? '#2DA8FF' : '#666'}
                            />
                            <Text style={modalStyles.defaultToggleText}>Set as default address</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Actions */}
                    <View style={modalStyles.actions}>
                        <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
                            <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSave}>
                            <Text style={modalStyles.saveBtnText}>
                                {address ? 'Update Address' : 'Save Address'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
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
    addBtn: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    addFirstBtn: {
        marginTop: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    addFirstBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        gap: 8,
    },
    addFirstBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        padding: 15,
        paddingBottom: 30,
    },
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    addressCardDefault: {
        borderWidth: 2,
        borderColor: '#2DA8FF',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    labelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    labelText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    defaultBadge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: '#EAF6FF',
        borderRadius: 8,
    },
    defaultText: {
        color: '#2DA8FF',
        fontSize: 11,
        fontWeight: '600',
    },
    fullAddress: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        marginBottom: 4,
    },
    landmark: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    cityArea: {
        fontSize: 13,
        color: '#999',
    },
    cardActions: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 16,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 13,
        color: '#2DA8FF',
        fontWeight: '500',
    },
    addMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        marginTop: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2DA8FF',
        borderStyle: 'dashed',
        gap: 8,
    },
    addMoreText: {
        fontSize: 16,
        color: '#2DA8FF',
        fontWeight: '600',
    },
});

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 16,
        paddingHorizontal: 20,
    },
    labelOptions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    labelOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        gap: 6,
    },
    labelOptionSelected: {
        backgroundColor: '#2DA8FF',
    },
    labelOptionText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    labelOptionTextSelected: {
        color: '#fff',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
    },
    halfInput: {
        flex: 1,
    },
    defaultToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 10,
    },
    defaultToggleText: {
        fontSize: 15,
        color: '#333',
    },
    actions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    saveBtn: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#2DA8FF',
        alignItems: 'center',
    },
    saveBtnText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
});
