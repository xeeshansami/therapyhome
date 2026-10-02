import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
    Box,
    CircularProgress,
    Divider,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Popper,
    Typography,
    ClickAwayListener,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { Search, SearchInput } from './styles';

// Same school id the fee portal falls back to, used when the store has no user.
const FALLBACK_ADMIN_ID = '68795ab802f2887382d217b0';

const MIN_QUERY = 2;
const DEBOUNCE_MS = 350;

// The student search endpoint builds a RegExp straight from this string, so
// escape anything that would otherwise be read as a pattern.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const GlobalSearch = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const adminID = currentUser?._id || FALLBACK_ADMIN_ID;

    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [allClasses, setAllClasses] = useState([]);

    const anchorRef = useRef(null);
    const requestIdRef = useRef(0);

    // Classes are a short list, so they are fetched once and matched locally
    // rather than hitting the API on every keystroke.
    useEffect(() => {
        let cancelled = false;
        const loadClasses = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/SclassList/${adminID}`);
                if (!cancelled) setAllClasses(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Could not load classes for search:', err);
                if (!cancelled) setAllClasses([]);
            }
        };
        loadClasses();
        return () => { cancelled = true; };
    }, [adminID]);

    const searchStudents = useCallback(async (term) => {
        const safe = escapeRegex(term);
        const payloads = [{ id: adminID, name: safe }];
        // A query containing digits is just as likely to be a roll number or a
        // parent's contact number, so ask for those too.
        if (/\d/.test(term)) {
            payloads.push({ id: adminID, rollNum: safe });
            payloads.push({ id: adminID, parentContact: safe });
        }

        const responses = await Promise.all(
            payloads.map((body) =>
                axios
                    .post(`${process.env.REACT_APP_BASE_URL}/students/search`, body)
                    .then((r) => r.data)
                    .catch(() => null)
            )
        );

        if (responses.every((r) => r === null)) {
            throw new Error('all student searches failed');
        }

        const seen = new Set();
        const merged = [];
        responses.forEach((data) => {
            // The endpoint answers with { message } instead of [] when nothing matches.
            if (!Array.isArray(data)) return;
            data.forEach((s) => {
                if (s && s._id && !seen.has(s._id)) {
                    seen.add(s._id);
                    merged.push(s);
                }
            });
        });
        return merged;
    }, [adminID]);

    useEffect(() => {
        const term = query.trim();
        if (term.length < MIN_QUERY) {
            setStudents([]);
            setClasses([]);
            setLoading(false);
            setFailed(false);
            return undefined;
        }

        setLoading(true);
        setFailed(false);
        const myRequest = ++requestIdRef.current;

        const timer = setTimeout(async () => {
            const lower = term.toLowerCase();
            const matchedClasses = allClasses.filter((c) =>
                String(c.sclassName || '').toLowerCase().includes(lower)
            );

            try {
                const matchedStudents = await searchStudents(term);
                if (requestIdRef.current !== myRequest) return; // a newer query won
                setStudents(matchedStudents);
                setClasses(matchedClasses);
            } catch (err) {
                if (requestIdRef.current !== myRequest) return;
                console.error('Global search failed:', err);
                setStudents([]);
                setClasses(matchedClasses);
                setFailed(true);
            } finally {
                if (requestIdRef.current === myRequest) setLoading(false);
            }
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [query, allClasses, searchStudents]);

    const resultCount = students.length + classes.length;
    const term = query.trim();
    const showPanel = open && term.length >= MIN_QUERY;

    const go = (path) => {
        setOpen(false);
        setQuery('');
        navigate(path);
    };

    const clear = () => {
        setQuery('');
        setStudents([]);
        setClasses([]);
        setFailed(false);
        setOpen(false);
    };

    const panelBody = useMemo(() => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Searching...</Typography>
                </Box>
            );
        }

        if (failed && resultCount === 0) {
            return (
                <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="error">
                        Unable to search records. Please try again.
                    </Typography>
                </Box>
            );
        }

        if (resultCount === 0) {
            return (
                <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        No records found for &ldquo;{term}&rdquo;.
                    </Typography>
                </Box>
            );
        }

        return (
            <>
                <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                        {resultCount} result{resultCount === 1 ? '' : 's'} found
                    </Typography>
                </Box>

                {students.length > 0 && (
                    <>
                        <Typography
                            variant="overline"
                            sx={{ px: 2, color: 'text.secondary', display: 'block' }}
                        >
                            Students
                        </Typography>
                        <List dense disablePadding>
                            {students.slice(0, 8).map((s) => (
                                <ListItemButton
                                    key={s._id}
                                    onClick={() => go(`/Admin/students/student/${s._id}`)}
                                >
                                    <ListItemText
                                        primary={s.name}
                                        secondary={[
                                            s.rollNum ? `Roll ${s.rollNum}` : null,
                                            s.sclassName?.sclassName || null,
                                        ].filter(Boolean).join(' · ')}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </>
                )}

                {students.length > 0 && classes.length > 0 && <Divider sx={{ my: 1 }} />}

                {classes.length > 0 && (
                    <>
                        <Typography
                            variant="overline"
                            sx={{ px: 2, color: 'text.secondary', display: 'block' }}
                        >
                            Classes
                        </Typography>
                        <List dense disablePadding>
                            {classes.slice(0, 8).map((c) => (
                                <ListItemButton
                                    key={c._id}
                                    onClick={() => go(`/Admin/classes/class/${c._id}`)}
                                >
                                    <ListItemText
                                        primary={c.sclassName}
                                        secondary={[
                                            c.timingType || null,
                                            c.sclassFee ? `Fee ${c.sclassFee}` : null,
                                        ].filter(Boolean).join(' · ')}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </>
                )}

                {failed && (
                    <Typography variant="caption" color="error" sx={{ px: 2, pb: 1.5, display: 'block' }}>
                        Some records could not be searched.
                    </Typography>
                )}
            </>
        );
    }, [loading, failed, resultCount, students, classes, term]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Box sx={{ position: 'relative', flexGrow: { xs: 1, md: 0 } }}>
                <Search ref={anchorRef}>
                    <SearchIcon fontSize="small" color="action" />
                    <SearchInput
                        placeholder="Search students, classes..."
                        inputProps={{ 'aria-label': 'search records' }}
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={(e) => { if (e.key === 'Escape') clear(); }}
                    />
                    {query && (
                        <IconButton size="small" onClick={clear} aria-label="clear search">
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
                </Search>

                <Popper
                    open={showPanel}
                    anchorEl={anchorRef.current}
                    placement="bottom-start"
                    style={{ zIndex: 1300 }}
                >
                    <Paper
                        elevation={6}
                        sx={{
                            mt: 1,
                            width: { xs: 'calc(100vw - 32px)', sm: 420 },
                            maxWidth: 420,
                            maxHeight: 420,
                            overflowY: 'auto',
                            borderRadius: 2,
                        }}
                    >
                        {panelBody}
                    </Paper>
                </Popper>
            </Box>
        </ClickAwayListener>
    );
};

export default GlobalSearch;
