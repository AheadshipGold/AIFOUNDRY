import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDesign } from '../../design-system/provider';
import { Icon } from '../../design-system/Icon';
import {
  subscribeSyncStatus,
  getSyncEngineStatus,
  SyncEngineStatus,
} from '../../services/offlineSync';

interface SyncStatusBannerProps {
  onPressConflicts?: () => void;
  onPressSyncNow?: () => void;
}

export function SyncStatusBanner({ onPressConflicts, onPressSyncNow }: SyncStatusBannerProps) {
  const { mode } = useDesign();
  const isDark = mode === 'dark';
  const [status, setStatus] = useState<SyncEngineStatus>({
    isOnline: true,
    pendingCount: 0,
    conflictCount: 0,
    lastSyncAt: null,
  });

  useEffect(() => {
    getSyncEngineStatus().then(setStatus);
    const unsubscribe = subscribeSyncStatus(setStatus);
    return () => unsubscribe();
  }, []);

  // Si tout est synchronisé et en ligne, rien à afficher
  if (status.isOnline && status.pendingCount === 0 && status.conflictCount === 0) {
    return null;
  }

  // 1. Cas Conflit Prioritaire
  if (status.conflictCount > 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#2D1600' : '#FFF3E0',
            borderColor: '#AD8455',
          },
        ]}
      >
        <View style={styles.left}>
          <Icon name="warning" size={16} color="#AD8455" />
          <Text style={[styles.text, { color: isDark ? '#FFE0B2' : '#E65100' }]}>
            {status.conflictCount === 1
              ? '1 conflit de stock détecté lors de la synchronisation'
              : `${status.conflictCount} conflits de stock à résoudre`}
          </Text>
        </View>
        {onPressConflicts && (
          <TouchableOpacity onPress={onPressConflicts} style={styles.actionBtn}>
            <Text style={styles.actionText}>Résoudre</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // 2. Cas Hors-ligne ou En attente de synchronisation
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0D1F1B' : '#E8F5E9',
          borderColor: isDark ? '#1B4D3E' : '#C8E6C9',
        },
      ]}
    >
      <View style={styles.left}>
        <Icon
          name={status.isOnline ? 'cloud' : 'cloud-slash'}
          size={16}
          color={isDark ? '#4E9F86' : '#2E7D32'}
        />
        <Text style={[styles.text, { color: isDark ? '#A7D7C5' : '#1B5E20' }]}>
          {!status.isOnline
            ? status.pendingCount > 0
              ? `Hors-ligne · ${status.pendingCount} opération(s) en attente`
              : 'Mode hors-ligne actif (consultation catalogue)'
            : `${status.pendingCount} opération(s) en cours de synchronisation...`}
        </Text>
      </View>
      {status.isOnline && status.pendingCount > 0 && onPressSyncNow && (
        <TouchableOpacity onPress={onPressSyncNow} style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: '#075D49' }]}>Synchroniser</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginLeft: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#AD8455',
  },
});
