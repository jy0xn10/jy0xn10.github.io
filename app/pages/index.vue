<script setup>
import { ref, onMounted } from 'vue'
import { doc, getDoc, setDoc, increment, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'

const { $db } = useNuxtApp()

const visitorCount = ref(0)
const guestbookList = ref([])
const form = ref({
  nickname: '',
  message: ''
})
const isSubmitting = ref(false)

const getKSTDateString = () => {
  const now = new Date();
  const kstOffset = 9 * 60;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kstDate = new Date(utc + (kstOffset * 60000));
  
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const updateAndGetVisitorCount = async () => {
  if (!$db) return

  const todayStr = getKSTDateString()
  const todayRef = doc($db, 'visitors', todayStr)
  const totalRef = doc($db, 'visitors', 'total')

  try {
    await setDoc(todayRef, { count: increment(1) }, { merge: true })
    const todaySnap = await getDoc(todayRef)
    if (todaySnap.exists()) {
      todayCount.value = todaySnap.data().count
    }

    await setDoc(totalRef, { count: increment(1) }, { merge: true })
    const totalSnap = await getDoc(totalRef)
    if (totalSnap.exists()) {
      totalCount.value = totalSnap.data().count
    }
  } catch (error) {
    console.error("방문자 카운터 업데이트 실패:", error)
  }
}

const fetchGuestbook = async () => {
  if (!$db) return

  try {
    const q = query(collection($db, 'guestbook'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    guestbookList.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error("방명록 불러오기 실패:", error)
  }
}

const addGuestbook = async () => {
  if (!form.value.nickname.trim() || !form.value.message.trim()) {
    alert('닉네임과 내용을 모두 입력해주세요!')
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    await addDoc(collection($db, 'guestbook'), {
      nickname: form.value.nickname,
      message: form.value.message,
      createdAt: serverTimestamp()
    })

    form.value.nickname = ''
    form.value.message = ''
    await fetchGuestbook()
  } catch (error) {
    console.error("방명록 작성 실패:", error)
    alert('작성에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  updateAndGetVisitorCount()
  fetchGuestbook()
})
</script>

<template>
    <div class="wrapper">
        <div class="main-container">
            <div class="banner">
                <img src="/images/image01.png" />
            </div>
            <div class="main">
                <aside>
                    <div class="social-media">
                        <h5>Social</h5>
                        <ul>
                            <li>
                                <a href="https://x.com/ryuonni10" target="_blank" rel="noopener noreferrer">
                                    <img src="https://cdn.simpleicons.org/x/000000" alt="X" class="icon" />
                                    <span>X</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://www.pixiv.net/users/127049264" target="_blank" rel="noopener noreferrer">
                                    <img src="https://cdn.simpleicons.org/pixiv/0096FA" alt="Pixiv" class="icon" />
                                    <span>Pixiv</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/jy0xn10" target="_blank" rel="noopener noreferrer">
                                    <img src="https://cdn.simpleicons.org/github/181717" alt="GitHub" class="icon" />
                                    <span>GitHub</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div class="visitor-counter">
                        <span>오늘 방문자: {{ visitorCount }}</span>
                    </div>
                    <div class="guestbook">
                        <h5>방명록</h5>
                        <div class="guestbook-list">
                            <div v-for="item in guestbookList" :key="item.id" class="guestbook-item">
                                <div class="item-header">
                                    <span class="item-nick">{{ item.nickname }}</span>
                                </div>
                                <p class="item-msg">{{ item.message }}</p>
                            </div>
                            <div v-if="guestbookList.length === 0" class="no-guestbook">
                                첫 번째 방명록을 남겨주세요!
                            </div>
                        </div>
                        <form @submit.prevent="addGuestbook" class="guestbook-form">
                            <input 
                                v-model="form.nickname" 
                                type="text" 
                                placeholder="닉네임" 
                                maxlength="20"
                            />
                            <textarea 
                                v-model="form.message" 
                                placeholder="방명록을 남겨주세요!" 
                                rows="2"
                                maxlength="150"
                            ></textarea>
                            <button type="submit" :disabled="isSubmitting">등록</button>
                        </form>
                    </div>
                </aside>
                <div class="content">
                    <h1>Ryuon Space</h1>
                    <span>
                        안녕하세요! 저는 류온이라고 합니다. 취미로 그림을 그리고 코딩을 하고 있어요.
                        작년부터 진지하게 취미를 해오고 있는데 바빠서 자주는 못하네요.
                        그래도 열심히 하려고 노력중입니다.
                        가볍게 사이트 만들었으니 한번 둘러보다 가보세요!
                    </span>
                    <p>
                        <strong>참고: 모바일에서는 UI가 깨질수 있습니다.</strong>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 100vh;
    background-image: url('/images/background.png');
    background-repeat: repeat;
}

.main-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    width: 60%;
    max-width: 1000px;
    height: 100%;
    min-height: calc(100vh - 50px);
    background-color: white;
    border-radius: 15px;
    overflow: hidden;
}

.banner {
    width: 100% ;
}

.banner img {
    width: 100%;
}

.main {
    display: flex;
    text-align: left;
    width: 100%;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
}

.main aside {
    width: 35%;
    padding-right: 15px;
    border-right: 1px solid #eee;
    box-sizing: border-box;
}

.main .content {
    flex: 1;
    padding-left: 15px;
    text-align: left;
}

.social-media ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.social-media a {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: #333;
    font-size: 0.85rem;
    padding: 6px 8px;
    border-radius: 6px;
    transition: background-color 0.2s ease;
}

.social-media a:hover {
    background-color: #f0f0f0;
}

.social-media .icon {
    width: 16px;
    height: 16px;
}

.visitor-counter {
    margin-top: 15px;
    font-size: 0.9rem;
    font-weight: bold;
}

.guestbook {
    margin-top: 20px;
}

.guestbook h5 {
    margin-bottom: 8px;
}

.guestbook-form {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
}

.guestbook-form input,
.guestbook-form textarea {
    width: 100%;
    padding: 6px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: inherit;
    resize: none;
}

.guestbook-form button {
    background-color: #333;
    color: white;
    border: none;
    padding: 6px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
}

.guestbook-form button:hover {
    background-color: #555;
}

.guestbook-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 150px;
    overflow-y: auto;
}

.guestbook-item {
    background: #f9f9f9;
    padding: 8px;
    border-radius: 6px;
    font-size: 0.8rem;
    border: 1px solid #eee;
}

.item-header {
    font-weight: bold;
    margin-bottom: 4px;
}

.item-msg {
    margin: 0;
    word-break: break-all;
    color: #333;
}

.no-guestbook {
    font-size: 0.75rem;
    color: #888;
    text-align: center;
    padding: 10px 0;
}
</style>