# 발표 배경조사 출처

[DrawTale_중간발표.pptx](DrawTale_중간발표.pptx) PART A에 쓴 수치와 인용의 출처다. 슬라이드의 `[번호]`가 아래 번호다.
조사일 2026-09-30. 원문을 직접 열어 확인한 것만 실었다.

## 사회적 배경 (슬라이드 3)

| 번호 | 출처 | 쓴 내용 |
|---|---|---|
| 1 | 김초은 · 임해영 · 김초영 (2023). 경계선 지적지능 아동청소년 자녀를 둔 어머니 양육 경험에 관한 연구. 『한국가족복지학』 70(1), 5–41. https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE11606563 | 사회적 차원에서 「기관으로부터 거부당하는 자녀, 부족한 국가지원, 열악한 교육과 돌봄 환경」 |
| 2 | 손성화 · 백수진 (2025). 경계선지능 청년의 평생교육에 대한 어머니의 인식과 지원요구. 『특수교육논총』 41(1), 167–201. https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE12094286 | 도출 주제 「어디에도 속하지 못한 고립과 단절」. **대상이 청년 자녀**다 |
| 3 | 임희진 · 구자경 (2019). 경계선 지능 자녀를 둔 어머니가 양육과정에서 경험한 어려움과 대처에 관한 내러티브 탐구. 『독서치료연구』 11(1), 63–84. https://www.kci.go.kr/kciportal/landing/article.kci?arti_id=ART002484150 | 무리한 학습을 요구하는 시행착오 → 자녀의 특성을 이해 · 수용하며 맞는 교육환경을 찾음 |
| 4 | 연합뉴스 (2026-09-05). 특수교육대상 '자폐성 장애' 학생 2만9천명 육박…4년만에 69%↑ (교육부 「2026 특수교육통계」 인용). https://supple.kr/news/cmtnign6n0025e2tr63rvpb5o | 특수교육대상 124,195명, 2022년 103,695명 대비 +19.8%. 교육부 원자료는 직접 열지 못했다 |
| 5 | 연합뉴스 (2026-07-29). 경계선 지능 첫 실태조사 (한국보건사회연구원, 보건복지부 의뢰). https://v.daum.net/v/20260729061254633 | 아동 · 청소년 5.1% 위험군(위험군 2.6% + 탐색군 2.5%), 보호자 85.1%가 발달 · 학습 비용을 사비로 지출 |

팀원 구성안이 인용한 「부모 대상 연구」 원 논문은 특정하지 못해, 내용이 가장 가까운 1 · 2로 대신했다.

## 교육적 배경 (슬라이드 4)

| 번호 | 출처 | 쓴 내용 |
|---|---|---|
| 6 | Pitri, E. & Michaelidou, A. (2025). The contribution of narrative drawing in early literacy. *Frontiers in Education*, 10. doi:10.3389/feduc.2025.1465714. https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1465714/full | 그림을 그리고 이야기를 짓는 활동이 초기 문해로 이어질 가능성. **아동 1명, 그림 35점의 사례연구**라 「가능성」으로만 쓴다 |
| 7 | CAST (2024). UDL Guidelines 3.0 — 5.1 Use multiple media for communication. https://udlguidelines.cast.org/action-expression/expression-communication/multiple-media/ | 표현 매체로 drawing · storytelling · animation 등을 예로 든다 |

## 기술 조사 (슬라이드 5)

| 번호 | 출처 | 쓴 내용 |
|---|---|---|
| 8 | Smith, H. J., Zheng, Q., Li, Y., Jain, S., Hodgins, J. K. (2023). A Method for Animating Children's Drawings of the Human Figure. *ACM Transactions on Graphics* 42(3), Article 32. https://arxiv.org/abs/2303.12741 | 네 단계(figure detection, segmentation masking, pose estimation/rigging, animation). Amateur Drawings Dataset 178,166장(bbox · mask · joint). 데모 공개 2021-12-16, 9개월간 670만 장 업로드 |
| 9 | Meta AI (2023-04-13). Animated Drawings 데이터셋 · 코드 공개. https://ai.meta.com/blog/ai-dataset-animation-drawings/ | 오픈소스 공개. 코드 · 가중치 · 데이터셋 MIT. 저장소는 2025-09-03 아카이브 |

슬라이드의 캐릭터 그림은 저장소 예제 `examples/characters/char1`(MIT)이다.

## 기존 서비스 조사 (슬라이드 6)

| 번호 | 서비스 | 확인한 것 (공식 사이트 · 스토어, 2026-09-30) |
|---|---|---|
| 10 | Drawings Alive — https://drawingsalive.com/ | 그림 업로드 · 앱에서 그리기, AI 애니메이션 · 3D · AR. 이야기 생성, 이야기 선택, 관절 보정 문구는 없음. 유료 구독 |
| 11 | Drawalive — https://drawalive.app/ | 그림 업로드 + 이야기 녹음 · 입력 → 애니메이션 + AI 낭독(22개+ 언어). AI가 이야기를 지어 주는지는 문구로 판단 불가(「일부」). 선택 · 관절 보정 없음 |
| — | Looma | **공식 사이트를 찾지 못했다.** 표의 값은 팀원 조사 기준이다. 공식 URL을 받아 확인해야 한다 |
| 8 | Meta Animated Drawings 데모 — https://sketch.metademolab.com | 논문 Fig. 9: 상자 · 마스크를 고치고 **관절을 옮긴 뒤** 동작을 고른다. 이야기 기능 없음 |

**발표 직전에 각 서비스의 최신 기능을 다시 확인한다.** 팀원 표와 달라진 칸: Drawings Alive 「이야기」 일부 → 없음, Drawings Alive · Drawalive 「아이의 선택」 제한적 → 없음 (공식 사이트에 해당 문구가 없다).

## 발견한 한계 (슬라이드 7)

| 번호 | 출처 | 쓴 내용 |
|---|---|---|
| 12 | The Alan Turing Institute (2025). Understanding the Impacts of Generative AI Use on Children (LEGO Foundation 후원). https://www.turing.ac.uk/sites/default/files/2025-05/combined_briefing_-_understanding_the_impacts_of_generative_ai_use_on_children.pdf | 창작에서 아이들은 손으로 만지는 재료를 선호. 「generative AI adds value alongside – not instead of – more tactile materials」 |

## 쓰지 않았지만 확인한 자료

필요하면 슬라이드에 더할 수 있다.

| 출처 | 내용 |
|---|---|
| 보건복지부 등록장애인 현황 2025 (서울신문 2026-04-19) https://www.seoul.co.kr/news/society/2026/04/19/20260419500082 | 지적장애 236,635명 + 자폐성장애 51,689명 ≈ 28.8만 명 |
| 교육부 경계선 지능 학생 지원방안 (뉴시스 2024-07-03) https://www.newsis.com/view/NISX20240703_0002797033 | 초중고생 약 78만 명 **추정**(인구 13.6%, 정규분포 이론치) |
| 교육부 특수교육 AI · 디지털 교육자료 보급 (아시아경제 2026-03-11) https://view.asiae.co.kr/article/2026031110114783614 | 발달장애 학생 약 7만 5천 명 대상, 「그림이나 아이콘 선택만으로도 수업 참여」 |
| AI 디지털교과서 활용 학교 감소 (경향신문 2026-09-21) https://www.khan.co.kr/article/202609212059025/ | 2025년 1학기 4,095곳 → 2026년 1학기 622곳 (−85%) |
| Doshi & Hauser (2024), *Science Advances* 10(28) https://www.sciencedaily.com/releases/2024/07/240712222127.htm | AI 아이디어를 받은 이야기끼리 10.7% 더 비슷해짐 |
| UNESCO 생성형 AI 교육 지침 (2023-09-07) https://www.unesco.org/en/articles/unesco-governments-must-quickly-regulate-generative-ai-schools | human agency 강조 |
| Wright et al. (2020), *Communication Disorders Quarterly* 42(1) https://journals.sagepub.com/doi/abs/10.1177/1525740119868440 | 그림을 설명할 때 평균 발화 길이가 더 길었다 (초록 기준) |
| HolonIQ (2020) https://www.holoniq.com/notes/global-education-technology-market-to-reach-404b-by-2025 | 글로벌 에듀테크 2025년 4,040억 달러 **전망치** |
