import React, { useState } from 'react';
import { CheckCircle2, XCircle, UserCheck } from 'lucide-react';

function CommentBadge({ type }) {
  if (type === 'legit') return <CheckCircle2 className="text-green-500" size={18} aria-label="Legit vote" />;
  if (type === 'fake') return <XCircle className="text-red-500" size={18} aria-label="Fake vote" />;
  return null;
}

export default function CommentsBreakdown({ legitComments, fakeComments, verifiedCheckers }) {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => setShowDetails((v) => !v);

  const renderComment = (comment, type) => (
    <li
      key={comment.id}
      className="border-b border-gray-700 py-2 last:border-b-0 break-words"
      tabIndex={0}
      aria-label={`${type === 'legit' ? 'Legit' : 'Fake'} comment by ${comment.author}, ${comment.ups} upvotes`}
    >
      <div className="flex items-center space-x-2 mb-1">
        <CommentBadge type={type} />
        <span className="font-semibold text-textPrimary">{comment.author}</span>
        {verifiedCheckers.has(comment.author) && (
          <UserCheck title="Verified Checker" className="text-camoGreen" size={16} />
        )}
        <span className="text-textMuted text-xs">({comment.ups} upvotes)</span>
      </div>
      <p className="text-textMuted text-sm whitespace-pre-wrap">{comment.body}</p>
    </li>
  );

  return (
    <section className="bg-card rounded p-4 mt-4 max-h-64 overflow-y-auto">
      <button
        type="button"
        onClick={toggleDetails}
        aria-expanded={showDetails}
        aria-controls="comments-breakdown-list"
        className="mb-3 text-camoGreen font-semibold focus:outline-none focus:ring-2 focus:ring-camoGreen rounded"
      >
        {showDetails ? 'Hide' : 'Show'} Comments Breakdown
      </button>
      {showDetails && (
        <ul id="comments-breakdown-list" className="divide-y divide-gray-700">
          {legitComments.length > 0 && (
            <>
              <li className="text-camoGreen font-bold mt-2 mb-1 select-none">Legit Votes</li>
              {legitComments.map((c) => renderComment(c, 'legit'))}
            </>
          )}
          {fakeComments.length > 0 && (
            <>
              <li className="text-red-500 font-bold mt-4 mb-1 select-none">Fake Votes</li>
              {fakeComments.map((c) => renderComment(c, 'fake'))}
            </>
          )}
          {legitComments.length === 0 && fakeComments.length === 0 && (
            <li className="text-textMuted">No comments breakdown available.</li>
          )}
        </ul>
      )}
    </section>
  );
}
