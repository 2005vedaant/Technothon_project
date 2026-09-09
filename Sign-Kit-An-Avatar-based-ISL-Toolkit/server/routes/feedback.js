const express = require('express');
const authenticateFirebaseToken = require('../middleware/authMiddleware');
const { auth } = require('../firebaseAdmin'); // Firebase Admin instance
const supabase = require('../supabase'); // Service‑role client

const router = express.Router();

// Allowed expression values
const VALID_EXPRESSIONS = [
  'Very Happy',
  'Happy',
  'Neutral',
  'Sad',
  'Very Sad',
];

/**
 * POST /api/feedback
 *
 * Expected headers:
 *   Authorization: Bearer <Firebase ID token>
 * Expected JSON body:
 *   { expression: string, feedback_text: string }
 */
router.post('/', authenticateFirebaseToken, async (req, res) => {
  console.log('[Feedback] Request received');
  try {
    const { expression, feedback_text } = req.body;

    // Log authenticated UID
    const uid = req.user.uid;
    console.log('[Feedback] Authenticated Firebase UID:', uid);

    // Validation
    if (!expression || !VALID_EXPRESSIONS.includes(expression)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing expression' });
    }
    const feedbackText = String(feedback_text || '').trim();
    if (!feedbackText) {
      return res.status(400).json({ success: false, message: 'Feedback text cannot be empty' });
    }

    // Look up profile from public.users table in Supabase
    console.log('[Feedback] Looking up profile for Firebase UID:', uid);
    let profile = null;
    try {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('full_name, username, email')
        .eq('firebase_uid', uid)
        .maybeSingle();

      if (profileError) {
        console.error('[Feedback] User profile query error:', profileError.message);
      } else if (data) {
        profile = data;
      }
    } catch (profileErr) {
      console.error('[Feedback] Unexpected error looking up profile:', profileErr.message);
    }
    console.log('[Feedback] Profile found:', !!profile);

    // Get Firebase user details as fallback
    let firebaseUser = null;
    try {
      firebaseUser = await auth.getUser(uid);
    } catch (fbErr) {
      console.warn('[Feedback] Could not fetch Firebase user record:', fbErr.message);
    }

    const userName = profile?.full_name || profile?.username || firebaseUser?.displayName || req.user.name || null;
    const userEmail = profile?.email || firebaseUser?.email || req.user.email || null;

    console.log('[Feedback] Attempting Supabase insert');
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          user_id: uid,
          user_name: userName,
          user_email: userEmail,
          expression,
          feedback_text: feedbackText,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[Feedback] Supabase insert error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return res.status(500).json({ success: false, message: `Failed to submit feedback: ${error.message}` });
    }

    console.log('[Feedback] Supabase insert successful, row ID:', data?.id);
    return res.status(201).json({ success: true, message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error('[Feedback] Unexpected error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
});

module.exports = router;
