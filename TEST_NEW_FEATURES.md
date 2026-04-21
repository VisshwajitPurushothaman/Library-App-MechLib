# Test Checklist: Book Availability & Who Has It Features

## Summary of New Features
Two key improvements have been implemented:
1. **Book Details Modal** - Shows who has borrowed each book and when
2. **Unavailable Books Visual Indicator** - Red-tinted cards for unavailable books instead of hiding them

## Pre-Test Requirements
- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:3001 (or 3000)
- ✅ Login with a test account (or use existing demo account)

---

## TEST CASE 1: Book Details Modal - User Browse Page

### 1.1 Navigate to Browse Page
- [ ] Click "Browse" or navigate to `/user/browse`
- [ ] See list of books with book cards

### 1.2 Test Available Book Modal
- [ ] Click on an **AVAILABLE** book (green/normal color)
- [ ] Modal should open with animation
- [ ] Verify modal shows:
  - [ ] Book title, author, code
  - [ ] Category, total copies, available copies
  - [ ] Book description (if available)
  - [ ] **"Currently Issued" section is EMPTY** (or shows "No active issues")
- [ ] Close modal (click X or click outside)
- [ ] Modal should close with animation

### 1.3 Test Unavailable Book Modal
- [ ] Click on an **UNAVAILABLE** book (red/tinted color)
- [ ] Modal should open with animation
- [ ] Verify modal shows:
  - [ ] Book title, author, code
  - [ ] Category, total copies, available copies = 0
  - [ ] **"Currently Issued" section shows list of who has the book:**
    - [ ] User name (e.g., "John Doe")
    - [ ] Roll number (e.g., "21CS001")
    - [ ] Status badge (should show "Issued" or "Overdue")
    - [ ] Issue date (when they borrowed it)
    - [ ] Due date (when it's due back)
- [ ] Close modal

### 1.4 Test Multiple Users Borrowing Same Book
- [ ] If any book has multiple copies and multiple are borrowed:
  - [ ] Click that book
  - [ ] Modal should list ALL users who have copies
  - [ ] Each user should be a separate entry in "Currently Issued"

---

## TEST CASE 2: Book Details Modal - Admin Books Page

### 2.1 Navigate to Admin Books Page
- [ ] Login as admin
- [ ] Click "Manage Books" or navigate to `/admin/books`
- [ ] See list of books with admin controls (edit, delete buttons)

### 2.2 Test Admin Can View Modal
- [ ] Click on any book card
- [ ] Modal should open with same details as user page
- [ ] Admin should be able to see who borrowed their books

### 2.3 Test Delete Button Doesn't Interfere
- [ ] Click delete button (should show confirmation or delete)
- [ ] Click a book card while in the list
- [ ] Verify delete button click doesn't open modal
- [ ] Verify book card click opens modal

---

## TEST CASE 3: Unavailable Books Visual Indicators

### 3.1 Test Availability Color Coding
- [ ] Find a book with `available_copies = 0` (unavailable)
- [ ] Verify the book card has **RED tint** background
- [ ] Verify book cover image has **reduced opacity** (~60%)
- [ ] Text should show "Unavailable" (not copy count)

### 3.2 Test Available Books Color Coding
- [ ] Find a book with `available_copies > 0` (available)
- [ ] Verify the book card has **normal/light color** background
- [ ] Verify book cover image has **full opacity**
- [ ] Text should show copy count (e.g., "2 available")

### 3.3 Test Color Consistency
- [ ] Verify color coding is consistent across:
  - [ ] User Browse page
  - [ ] Admin Books page
  - [ ] Modal header

---

## TEST CASE 4: Modal Issue Details

### 4.1 Test Issue Date Display
- [ ] Open modal for book with active issues
- [ ] Issue date should show in readable format (e.g., "Apr 10, 2026")
- [ ] Should match the date shown in admin's issue history

### 4.2 Test Due Date Display
- [ ] Due date should show in readable format
- [ ] Should be calculated from issue_date + due days (usually 14 days)

### 4.3 Test Return Date Display
- [ ] For **non-returned** issues: return date field should be empty or not shown
- [ ] For **returned** issues: return date should be visible in red badge with "Returned" status

### 4.4 Test Status Badge Colors
- [ ] **"Issued"** - should show in blue/emerald color
- [ ] **"Overdue"** - should show in red/orange color (if due date has passed)
- [ ] **"Returned"** - should show in gray/muted color

---

## TEST CASE 5: API Integration

### 5.1 Test Backend Endpoint
- [ ] Open browser DevTools (F12)
- [ ] Go to Browse page and click a book
- [ ] In Network tab, look for GET request to `/api/books/issues/:bookCode`
- [ ] Status should be **200 OK**
- [ ] Response should contain:
  - [ ] `success: true`
  - [ ] `data.book` with book details
  - [ ] `data.issues` array with issue objects
  - [ ] Each issue should have: `user_name`, `roll_number`, `issue_date`, `due_date`, `status`

### 5.2 Test Error Handling
- [ ] In DevTools, manually call: 
  ```
  fetch('/api/books/issues/NONEXISTENT')
  ```
- [ ] Should return 404 or error status
- [ ] Modal should handle gracefully (show error message or empty state)

---

## TEST CASE 6: Performance

### 6.1 Test Modal Load Time
- [ ] Click book and measure modal appearance time
- [ ] Should appear within 1-2 seconds
- [ ] No freezing or lag

### 6.2 Test With Many Issues
- [ ] If any book has many active issues (10+):
  - [ ] Modal should still load quickly
  - [ ] List should be scrollable if needed
  - [ ] No performance degradation

---

## EDGE CASES

### E1: Book With No Issues
- [ ] Click book with `available_copies = total_copies`
- [ ] Modal should show empty "Currently Issued" section
- [ ] No errors in console

### E2: Book Just Returned
- [ ] Issue is returned but modal still shows it in list?
  - [ ] Should NOT show (filter by `return_date: null`)
  - [ ] Only active (non-returned) issues should appear

### E3: Overdue Books
- [ ] If due_date has passed:
  - [ ] Status should show "Overdue" (red badge)
  - [ ] Not just "Issued"

### E4: Multiple Copies Available But Some Issued
- [ ] Book with `total_copies: 5`, `available_copies: 2` (3 issued)
- [ ] Header shows: "5 total, 2 available"
- [ ] "Currently Issued" shows 3 users

---

## EXPECTED RESULTS SUMMARY

| Test Case | Expected Result |
|-----------|-----------------|
| Available book modal | Shows book details, empty issues list |
| Unavailable book modal | Shows book details, lists all users |
| Red tinting | Unavailable books show red background |
| Normal color | Available books show normal color |
| API endpoint | Returns 200 with book and issues data |
| Modal performance | Loads within 1-2 seconds |
| Error handling | Gracefully handles missing books |

---

## KNOWN LIMITATIONS
- Modal shows non-returned issues only (by design)
- Book cover images must be valid URLs
- Status calculation depends on due_date (no real-time overdue checking)

---

## If Issues Found
1. Check browser console (F12) for JavaScript errors
2. Check backend terminal for API errors
3. Verify database has sample data with issued books
4. Check that `/api/books/issues/:bookCode` endpoint is registered (see backend logs)

---

## Regression Tests
Ensure existing features still work:
- [ ] Book search filter works
- [ ] Book create/edit (admin) works
- [ ] Issue books dialog works
- [ ] Return books works
- [ ] Page navigation works
