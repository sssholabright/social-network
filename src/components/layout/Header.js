import React, { useState } from 'react'
import { Box, Flex, Text, Button, useColorMode, useColorModeValue, InputGroup, InputLeftElement, Input, IconButton, Menu, MenuButton, Avatar, MenuList, MenuItem, useDisclosure, Popover, PopoverTrigger, Badge, PopoverContent, VStack, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody } from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiBell, FiMenu, FiMessageSquare, FiMoon, FiSearch, FiSun } from 'react-icons/fi'
import { useNotifications } from '../../pages/Notifications'
import { useAuth } from '../../hooks/useAuth'

const MotionBox = motion(Box)

export default function Header() {
    const location = useLocation()
    const { colorMode, toggleColorMode } = useColorMode()
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const { user, logout } = useAuth()
    const { notifications } = useNotifications();

    const unreadNotifications = notifications.filter(n => !n.read).length;

    const { isOpen, onOpen, onClose } = useDisclosure()

    const isActive = (path) => location.pathname === path   

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
{/* 
                <Box display={{ base: 'none', md: 'block' }} flexGrow={1} mx={4}>
                    <SearchAutocomplete />
                </Box> */}

                {user ? (
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
                ) : null}

                <Flex align="center">
                    <IconButton
                        icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                        onClick={toggleColorMode}
                        variant="ghost"
                        mr={2}
                        aria-label="Toggle color mode"
                    />
                    {user ? (
                        <>
                            <Popover>
                                <PopoverTrigger>
                                    <IconButton
                                        icon={<FiBell />}
                                        variant="ghost"
                                        mr={2}
                                        aria-label="Notifications"
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
                                as={user ? Link : Box}
                                to="/messages"
                                icon={<FiMessageSquare />}
                                variant="ghost"
                                mr={2}
                                aria-label="Messages"
                                bg={isActive('/messages') ? 'blue.100' : 'transparent'}
                            />
                        </>
                    ) : null}
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
                            <Avatar size="sm" name={user?.name} src={user?.profileimg || 'https://bit.ly/dan-abramov'} />
                        </MenuButton>
                        {user ? (
                            <MenuList>
                                <MenuItem as={Link} to="/profile">Profile</MenuItem>
                                <MenuItem as={Link} to="/settings">Settings</MenuItem>
                                <MenuItem onClick={logout}>Logout</MenuItem>
                            </MenuList>
                        ) : null}
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
                    <DrawerHeader>Menu</DrawerHeader>
                    <DrawerBody>
                        <VStack align="stretch">
                            <Button as={Link} to="/" onClick={onClose}>Home</Button>
                            <Button as={Link} to="/profile" onClick={onClose}>Profile</Button>
                            <Button as={Link} to="/messages" onClick={onClose}>Messages</Button>
                            <Button as={Link} to="/settings" onClick={onClose}>Settings</Button>
                            <Button onClick={logout}>Logout</Button>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </MotionBox>
    )
}