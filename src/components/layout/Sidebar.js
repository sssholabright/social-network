import { Box, Icon, Text, Tooltip, useColorModeValue, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import React from 'react'
import { FiHome, FiLogOut, FiMessageSquare, FiSettings, FiUser, FiUsers } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const MotionBox = motion(Box)

const MenuItem = ({ icon, label, to }) => {
    const location = useLocation()
    const isActive = location.pathname === to
    const activeColor = useColorModeValue('brand.500', 'gray.700')
    const hoverBg = useColorModeValue('gray.100', 'gray.700')

    return (
        <Tooltip label={label} placement="right" hasArrow>
            <MotionBox
                as={Link}
                to={to}
                display="flex"
                alignItems="center"
                py={2}
                px={3}
                borderRadius="md"
                color={isActive ? activeColor : 'inherit'}
                bg={isActive ? hoverBg : 'transparent'}
                _hover={{ bg: hoverBg }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                cursor="pointer"
            >
                <Icon as={icon} boxSize={6} />
                <Text ml={4} display={{ base: 'none', md: 'block' }}>{label}</Text>
            </MotionBox>
        </Tooltip>
    )
}

export default function Sidebar() {
    const { logout, user } = useAuthStore();
    const bgColor = useColorModeValue('white', 'gray.800')
    const borderColor = useColorModeValue('gray.200', 'gray.700')

    return (
        <Box 
            as="nav" 
            pos="fixed"
            top="60px"  // Adjusted to account for header height
            left="0"
            w={{ base: '60px', md: '200px' }}
            h="calc(100vh - 60px)"
            borderRight="1px solid"
            borderColor={borderColor}
            bg={bgColor}
            overflowY="auto"
            css={{
                '&::-webkit-scrollbar': {
                    width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: borderColor,
                    borderRadius: '24px',
                },
            }}
            zIndex="sticky"
        >
            <VStack
                spacing="1"
                align="stretch"
                mt={4}
            >
                <MenuItem icon={FiHome} label="Home" to="/" />
                <MenuItem icon={FiUser} label="Profile" to={`/profile/${user?.uid}`} />
                <MenuItem icon={FiUsers} label="Friends" to="/friends" />
                <MenuItem icon={FiMessageSquare} label="Messages" to="/messages" />
                <MenuItem icon={FiSettings} label="Settings" to="/settings" />
                <MenuItem icon={FiLogOut} label="Logout" onClick={logout} />
            </VStack>
        </Box>
    )
}