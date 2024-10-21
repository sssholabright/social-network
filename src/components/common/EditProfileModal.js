import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

export default function EditProfileModal({ isOpen, onClose, onSubmit, initialData }) {

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialData,
    });

    const Submit = (data) => {
        onSubmit(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Profile</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit(Submit)}>
                <ModalBody>
                    <FormControl isInvalid={errors.name}>
                        <FormLabel>Name</FormLabel>
                        <Input {...register('name', { required: 'Name is required' })} />
                    </FormControl>
                    <FormControl mt={4} isInvalid={errors.bio}>
                        <FormLabel>Bio</FormLabel>
                        <Textarea {...register('bio')} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" type="submit">
                        Save
                    </Button>
                </ModalFooter>
            </form>
        </ModalContent>
    </Modal>
  );
}