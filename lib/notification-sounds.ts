export type NotificationSoundType = 'order_received' | 'order_ready' | 'order_updated' | 'payment';

const SOUND_VOLUMES: Record<NotificationSoundType, number> = {
  order_received: 1.0,   // Maximum volume for new orders
  order_ready: 1.0,      // Maximum volume for ready orders
  order_updated: 0.8,    // High volume for updates
  payment: 0.9,          // High volume for payments
};

export async function playNotificationSound(
  soundType: NotificationSoundType,
  baseVolume: number = SOUND_VOLUMES[soundType]
): Promise<void> {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = Math.min(baseVolume, 1.0); // Ensure volume doesn't exceed 1.0
    
    // Play the sound
    const playPromise = audio.play();
    
    // Handle browser autoplay restrictions
    if (playPromise !== undefined) {
      await playPromise.catch(() => {
        // Ignore autoplay errors
      });
    }
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
}

export function getNotificationMessage(type: string): string {
  const messages: Record<string, string> = {
    new_order: '📱 New Order',
    order_ready: '✅ Order Ready',
    order_started: '👨‍🍳 Order Started',
    payment_received: '💰 Payment Received',
    order_modified: '✏️ Order Modified',
    order_served: '🍽️ Order Served',
  };
  return messages[type] || 'Notification';
}
