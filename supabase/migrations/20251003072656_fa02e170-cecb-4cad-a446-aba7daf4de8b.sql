-- Drop the existing view
DROP VIEW IF EXISTS stories_with_authors;

-- Recreate the view with is_anonymous field and correct table reference
CREATE VIEW stories_with_authors AS
SELECT 
  s.id,
  s.title,
  s.snippet,
  s.content,
  s.cover_image,
  s.tags,
  s.tag_type,
  s.author_id,
  s.is_featured,
  s.is_anonymous,
  s.published_at,
  s.created_at,
  s.updated_at,
  u.name as author_name,
  u.profile_image as author_image
FROM stories s
LEFT JOIN users u ON s.author_id = u.id;