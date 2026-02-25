-- Add order column to tasks table for drag and drop persistence
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create index for better performance when ordering
CREATE INDEX IF NOT EXISTS idx_tasks_display_order ON tasks(user_id, display_order);

-- Update existing tasks to have sequential order based on creation date
WITH ordered_tasks AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as row_num
  FROM tasks
)
UPDATE tasks
SET display_order = ordered_tasks.row_num
FROM ordered_tasks
WHERE tasks.id = ordered_tasks.id;

-- Add comment to column
COMMENT ON COLUMN tasks.display_order IS 'Display order for drag and drop. Lower numbers appear first.';
