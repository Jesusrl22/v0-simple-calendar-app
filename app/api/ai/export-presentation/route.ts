import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServiceRoleClient } from "@/lib/supabase/server"

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.sub || null
  } catch {
    return null
  }
}

const CREDIT_COSTS = {
  "presentation-5": 7,
  "presentation-10": 12,
}

export async function POST(req: NextRequest) {
  try {
    const { content, title = "Presentation", slideCount = 5 } = await req.json()

    if (!content || !Array.isArray(content) || content.length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = getUserIdFromToken(accessToken)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const supabaseAdmin = await createServiceRoleClient()

    // Get user credits
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("ai_credits, ai_credits_purchased")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const creditCost =
      slideCount === 5 ? CREDIT_COSTS["presentation-5"] : CREDIT_COSTS["presentation-10"]
    const totalCredits = (userData.ai_credits || 0) + (userData.ai_credits_purchased || 0)

    if (totalCredits < creditCost) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: `This presentation requires ${creditCost} credits, but you only have ${totalCredits}`,
        },
        { status: 402 },
      )
    }

    // Create presentation as HTML (interactive, downloadable as .html)
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #0f172a;
            color: #fff;
            overflow: hidden;
        }
        .presentation { 
            display: flex;
            flex-direction: column;
            height: 100vh;
            background: #0f172a;
        }
        .slide-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }
        .slide {
            display: none;
            width: 95%;
            height: 95%;
            max-width: 1200px;
            max-height: 800px;
            background: #1e293b;
            border-radius: 12px;
            padding: 60px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            border: 1px solid #334155;
            animation: fadeIn 0.3s ease-in;
        }
        .slide.active { display: flex; flex-direction: column; }
        .slide h1 { 
            color: #54d946;
            font-size: 2.5rem;
            margin-bottom: 20px;
            word-wrap: break-word;
        }
        .slide p { 
            font-size: 1.1rem;
            line-height: 1.6;
            color: #e2e8f0;
            margin-bottom: 20px;
            flex: 1;
            overflow-y: auto;
        }
        .slide img {
            max-width: 100%;
            max-height: 400px;
            border-radius: 8px;
            margin: 20px 0;
            object-fit: contain;
        }
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 60px;
            background: #1e293b;
            border-top: 1px solid #334155;
        }
        button {
            background: #54d946;
            color: #0f172a;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        button:hover { 
            background: #4ade80;
            transform: scale(1.05);
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        .slide-counter {
            font-size: 1rem;
            color: #94a3b8;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .title-slide { justify-content: center; text-align: center; }
        .title-slide h1 { font-size: 3rem; }
        .title-slide p { 
            font-size: 1.3rem;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="presentation">
        <div class="slide-container">
            <div id="slides"></div>
        </div>
        <div class="controls">
            <button id="prevBtn" onclick="previousSlide()">← Previous</button>
            <span class="slide-counter"><span id="currentSlide">1</span> / <span id="totalSlides">0</span></span>
            <button id="nextBtn" onclick="nextSlide()">Next →</button>
        </div>
    </div>

    <script>
        const data = ${JSON.stringify(JSON.stringify(presentationData))};
        const parsedData = JSON.parse(data);
        let currentSlide = 0;

        function init() {
            const slidesContainer = document.getElementById('slides');
            document.getElementById('totalSlides').textContent = parsedData.slides.length;
            
            parsedData.slides.forEach((slide, idx) => {
                const slideEl = document.createElement('div');
                slideEl.className = 'slide' + (idx === 0 ? ' active' : '');
                const imageHtml = slide.imageUrl ? '<img src="' + slide.imageUrl + '" alt="Slide image">' : '';
                const contentText = (slide.content || '').replace(/\n/g, '<br>');
                slideEl.innerHTML = '<h1>' + (slide.title || 'Slide ' + (idx + 1)) + '</h1>' + imageHtml + '<p>' + contentText + '</p>';
                slidesContainer.appendChild(slideEl);
            });
            
            updateControls();
        }

        function showSlide(n) {
            const slides = document.querySelectorAll('.slide');
            if (n >= slides.length) currentSlide = slides.length - 1;
            if (n < 0) currentSlide = 0;
            
            slides.forEach(s => s.classList.remove('active'));
            slides[currentSlide].classList.add('active');
            document.getElementById('currentSlide').textContent = currentSlide + 1;
            updateControls();
        }

        function nextSlide() {
            currentSlide++;
            showSlide(currentSlide);
        }

        function previousSlide() {
            currentSlide--;
            showSlide(currentSlide);
        }

        function updateControls() {
            const slides = document.querySelectorAll('.slide');
            document.getElementById('prevBtn').disabled = currentSlide === 0;
            document.getElementById('nextBtn').disabled = currentSlide === slides.length - 1;
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') previousSlide();
        });

        init();
    </script>
</body>
</html>`

    // Deduct credits
    let newMonthlyCredits = userData.ai_credits || 0
    let newPurchasedCredits = userData.ai_credits_purchased || 0

    if (creditCost <= newMonthlyCredits) {
      newMonthlyCredits -= creditCost
    } else {
      const remaining = creditCost - newMonthlyCredits
      newMonthlyCredits = 0
      newPurchasedCredits -= remaining
    }

    await supabaseAdmin
      .from("users")
      .update({
        ai_credits: Math.max(0, newMonthlyCredits),
        ai_credits_purchased: Math.max(0, newPurchasedCredits),
      })
      .eq("id", userId)

    // Return as HTML file
    const buffer = Buffer.from(htmlContent)
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${title.replace(/\s+/g, "_")}_presentation_${slideCount}slides.html"`,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error exporting presentation:", error)
    return NextResponse.json(
      { error: "Failed to export presentation", message: error.message },
      { status: 500 },
    )
  }
}
