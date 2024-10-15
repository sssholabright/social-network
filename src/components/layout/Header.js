import React, { useState } from 'react'
import { Box, Flex, Text, Button, useColorMode, useColorModeValue, InputGroup, InputLeftElement, Input, IconButton, Menu, MenuButton, Avatar, MenuList, MenuItem } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiBell, FiMessageSquare, FiMoon, FiSearch } from 'react-icons/fi'

const MotionBox = motion(Box)

export default function Header() {
    const { colorMode, toggleColorMode } = useColorMode()
    const [isSearchFocused, setIsSearchFocused] = useState(false)

    const bgColor = useColorModeValue('white', 'gray.800')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

    return (
        <MotionBox
            as="header"
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex="sticky"
            backgroundColor={bgColor}
            borderBottom={`1px solid ${borderColor}`}
            boxShadow="sm"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 10 }}
        >
            <Flex align="center" justify="space-between" maxW="container.xl" mx="auto" px={4} py={2}>
                <Link to="/">
                    <MotionBox
                        fontWeight="bold"
                        fontSize="xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Text>SocialNet</Text>
                    </MotionBox>
                </Link>

                <InputGroup maxW="400px" mx={4}>
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray.300" />
                    </InputLeftElement>
                    <Input 
                        type="text" 
                        placeholder="Search..." 
                        onFocus={() => setIsSearchFocused(true)} 
                        onBlur={() => setIsSearchFocused(false)} 
                        borderColor={isSearchFocused ? 'blue.500' : borderColor}
                        _hover={{
                            borderColor: 'blue.500',
                        }}
                        transition="all 0.2s"
                    />
                </InputGroup>

                <Flex align="center">
                    <IconButton
                        icon={<FiMoon />}
                        onClick={toggleColorMode}
                        variant="ghost"
                        mr={2}
                        aria-label="Toggle Dark Mode"
                    />
                    <IconButton
                        as={Link}
                        to="/notifications"
                        icon={<FiBell />}
                        variant="ghost"
                        mr={2}
                        aria-label="Notifications"
                    />
                    <IconButton
                        as={Link}
                        to="/messages"
                        icon={<FiMessageSquare />}
                        variant="ghost"
                        mr={2}
                        aria-label="Messages"
                    />
                    <Menu>
                        <MenuButton
                            as={Button}
                            rounded="full"
                            variant="link"
                            cursor="pointer"
                            minW={0}
                            p={0}
                            m={0}
                        >
                            <Avatar size="sm" src="https://bit.ly/dan-abramov" />
                        </MenuButton>
                        <MenuList>
                            <MenuItem as={Link} to="/profile">Profile</MenuItem>
                            <MenuItem as={Link} to="/settings">Settings</MenuItem>
                            <MenuItem as={Link} to="/logout">Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            </Flex>
        </MotionBox>
    )
}


/*
import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  useColorModeValue,
  Button,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  VStack,
  Text,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMoon, FiSun, FiBell, FiMessageSquare, FiMenu } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';
import SearchAutocomplete from '../common/SearchAutocomplete';
import { useTranslation } from 'react-i18next';

const MotionBox = motion(Box);

function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const { notifications } = useNotifications();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t, i18n } = useTranslation();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const isActive = (path) => location.pathname === path;

  return (
    <MotionBox
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      backgroundColor={bgColor}
      boxShadow="sm"
      zIndex="sticky"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto" px={4} py={2}>
        <RouterLink to="/">
          <MotionBox
            fontWeight="bold"
            fontSize="xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            SocialNet
          </MotionBox>
        </RouterLink>

        <Box display={{ base: 'none', md: 'block' }} flexGrow={1} mx={4}>
          <SearchAutocomplete />
        </Box>

        <Flex align="center">
          <IconButton
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
            mr={2}
            aria-label={t('Toggle color mode')}
          />
          <Popover>
            <PopoverTrigger>
              <IconButton
                icon={<FiBell />}
                variant="ghost"
                mr={2}
                aria-label={t('Notifications')}
                position="relative"
              >
                {unreadNotifications > 0 && (
                  <Badge
                    position="absolute"
                    top="-1"
                    right="-1"
                    colorScheme="red"
                    variant="solid"
                    fontSize="xs"
                    borderRadius="full"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </IconButton>
            </PopoverTrigger>
            <PopoverContent>
              <VStack align="stretch" p={2}>
                {notifications.slice(0, 5).map((notification) => (
                  <Box key={notification.id} p={2} _hover={{ bg: 'gray.100' }}>
                    <Text fontSize="sm">{notification.message}</Text>
                  </Box>
                ))}
              </VStack>
            </PopoverContent>
          </Popover>
          <IconButton
            as={RouterLink}
            to="/messages"
            icon={<FiMessageSquare />}
            variant="ghost"
            mr={4}
            aria-label={t('Messages')}
            bg={isActive('/messages') ? 'blue.100' : 'transparent'}
          />
          <Menu>
            <MenuButton
              as={Button}
              rounded="full"
              variant="link"
              cursor="pointer"
              minW={0}
            >
              <Avatar size="sm" name={user?.name} src={user?.avatar} />
            </MenuButton>
            <MenuList>
              <MenuItem as={RouterLink} to="/profile">{t('Profile')}</MenuItem>
              <MenuItem as={RouterLink} to="/settings">{t('Settings')}</MenuItem>
              <MenuItem onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en')}>
                {t('Change Language')}
              </MenuItem>
              <MenuItem onClick={logout}>{t('Logout')}</MenuItem>
            </MenuList>
          </Menu>
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            icon={<FiMenu />}
            aria-label="Open menu"
            ml={2}
          />
        </Flex>
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('Menu')}</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch">
              <Button as={RouterLink} to="/" onClick={onClose}>{t('Home')}</Button>
              <Button as={RouterLink} to="/profile" onClick={onClose}>{t('Profile')}</Button>
              <Button as={RouterLink} to="/messages" onClick={onClose}>{t('Messages')}</Button>
              <Button as={RouterLink} to="/settings" onClick={onClose}>{t('Settings')}</Button>
              <Button onClick={logout}>{t('Logout')}</Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </MotionBox>
  );
}

export default Header;*/