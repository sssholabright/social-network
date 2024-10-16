import { Box, Container, Link, Stack, Text, useColorModeValue, IconButton, Flex } from '@chakra-ui/react'
import React from 'react'
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';

const SocialButton = ({ children, label, href }) => {
    return (
        <IconButton
            bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
            rounded={'full'}
            w={8}
            h={8}
            cursor={'pointer'}
            as={'a'}
            href={href}
            display={'inline-flex'}
            alignItems={'center'}
            justifyContent={'center'}
            transition={'background 0.3s ease'}
            _hover={{
                bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
            }}
            aria-label={label}
        >
            {children}
        </IconButton>
    )
}

export default function Footer() {
    const linkColor = useColorModeValue('gray.600', 'gray.400')
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Box
            bg={useColorModeValue('gray.50', 'gray.900')}
            color={useColorModeValue('gray.700', 'gray.200')}
            borderTop={1}
            borderStyle={'solid'}
            borderColor={borderColor}
            width="100%"
        >
            <Container
                as={Stack}
                maxW={'6xl'}
                py={4}
                spacing={4}
                justify={{ base: 'center', md: 'space-between' }}
                align={{ base: 'center', md: 'center' }}
            >
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify={{ base: 'center', md: 'space-between' }}
                    align={{ base: 'center', md: 'center' }}
                    width="100%"
                    wrap="wrap"
                >
                    <Stack direction={'row'} spacing={6} mb={{ base: 4, md: 0 }} wrap="wrap" justify="center">
                        <Link href={'#'} color={linkColor}>About</Link>
                        <Link href={'#'} color={linkColor}>Blog</Link>
                        <Link href={'#'} color={linkColor}>Contact</Link>
                        <Link href={'#'} color={linkColor}>Privacy Policy</Link>
                        <Link href={'#'} color={linkColor}>Terms of Use</Link>
                    </Stack>
                    
                    <Text textAlign="center" mb={{ base: 4, md: 0 }}>
                        © 2024 Bright TeamHub. All rights reserved. Made with ❤️ by <Link href="https://github.com/sssholabright" color={linkColor}>Mujeeb Adejobi</Link>
                    </Text>

                    <Stack direction={'row'} spacing={6} justify="center">
                        <SocialButton label={'Twitter'} href={'#'}>
                            <FaTwitter />
                        </SocialButton>
                        <SocialButton label={'Facebook'} href={'#'}>
                            <FaFacebook />
                        </SocialButton>
                        <SocialButton label={'Instagram'} href={'#'}>
                            <FaInstagram />
                        </SocialButton>
                        <SocialButton label={'LinkedIn'} href={'#'}>
                            <FaLinkedin />
                        </SocialButton>
                    </Stack>
                </Flex>
            </Container>
        </Box>
    )
}