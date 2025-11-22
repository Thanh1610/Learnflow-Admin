import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { useTranslations } from 'next-intl';

type CustomModalProps = {
  title: string;
  description: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
};

export default function CustomModal({
  title,
  description,
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
}: CustomModalProps) {
  const t = useTranslations('app');
  return (
    <Modal
      backdrop="opaque"
      classNames={{
        backdrop:
          'bg-linear-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20',
      }}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>{description}</ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                {t('close')}
              </Button>
              <Button color="primary" onPress={onConfirm} isLoading={isLoading}>
                {t('confirm')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
