import {
    TableCell,
    TableRow,
    styled,
    tableCellClasses,
    Drawer as MuiDrawer,
    AppBar as MuiAppBar,
    InputBase,
} from "@mui/material";

const drawerWidth = 240

// EduMin-style search pill for the header (visual only).
export const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: theme.palette.mode === 'light' ? '#f3f4f9' : 'rgba(255,255,255,0.06)',
    border: `1px solid ${theme.palette.divider}`,
    padding: '4px 14px',
    width: '100%',
    maxWidth: 360,
    transition: 'box-shadow .15s ease, border-color .15s ease',
    '&:focus-within': {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 3px ${theme.palette.primary.main}22`,
    },
    [theme.breakpoints.down('sm')]: { display: 'none' },
}));

export const SearchInput = styled(InputBase)(({ theme }) => ({
    marginLeft: 8,
    flex: 1,
    color: theme.palette.text.primary,
    fontSize: 14,
    '& input::placeholder': { color: theme.palette.text.secondary, opacity: 1 },
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => {
    const isLight = theme.palette.mode === 'light';
    return {
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: isLight ? '#f6f7fb' : 'rgba(255,255,255,0.04)',
            color: theme.palette.text.primary,
            fontWeight: 600,
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
    };
});

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.mode === 'light' ? '#fbfbfe' : 'rgba(255,255,255,0.02)',
    },
    '&:hover': {
        backgroundColor:
            theme.palette.mode === 'light'
                ? 'rgba(77, 68, 224, 0.05)'
                : 'rgba(255,255,255,0.05)',
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow:
        theme.palette.mode === 'light'
            ? '0 2px 10px rgba(45, 55, 99, 0.06)'
            : '0 2px 10px rgba(0, 0, 0, 0.45)',
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundImage: 'none',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

export const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow:
                theme.palette.mode === 'light'
                    ? '0 0 18px rgba(45, 55, 99, 0.04)'
                    : '0 0 18px rgba(0, 0, 0, 0.35)',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);